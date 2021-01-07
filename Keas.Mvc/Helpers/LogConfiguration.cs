using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Elastic.Apm.SerilogEnricher;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Context;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Sinks.Elasticsearch;
using StackifyLib;

namespace Keas.Mvc.Helpers
{
    public static class LogConfiguration
    {
        private static bool _loggingSetup;

        private static IConfigurationRoot _configuration;

        public static void Setup(IConfigurationRoot configuration)
        {
            if (_loggingSetup) return;

            // save configuration for later calls
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

            // create global logger with standard configuration
            Log.Logger = GetConfiguration().CreateLogger();

            AppDomain.CurrentDomain.UnhandledException += (sender, e) => Log.Fatal(e.ExceptionObject as Exception, e.ExceptionObject.ToString());

            AppDomain.CurrentDomain.ProcessExit += (sender, e) => Log.CloseAndFlush();

#if DEBUG
            Serilog.Debugging.SelfLog.Enable(msg => Debug.WriteLine(msg));
#endif

            _loggingSetup = true;
        }

        /// <summary>
        /// Get a logger configuration that logs to stackify
        /// </summary>
        /// <returns></returns>
        public static LoggerConfiguration GetConfiguration()
        {
            if (_configuration == null) throw new InvalidOperationException("Call Setup() before requesting a Logger Configuration"); ;

            // standard logger
            var logConfig = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                // .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning) // uncomment this to hide EF core general info logs
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .Enrich.WithElasticApmCorrelationInfo()
                .Enrich.FromLogContext()
                .Enrich.WithClientIp()
                .Enrich.WithClientAgent()
                .Enrich.WithExceptionDetails();

            // various sinks
            logConfig = logConfig
                .WriteTo.Console()
                .WriteToStackifyCustom()
                .WriteToElasticSearchCustom();

            return logConfig;
        }

        private static LoggerConfiguration WriteToStackifyCustom(this LoggerConfiguration logConfig)
        {
            if (!_loggingSetup)
            {
                _configuration.ConfigureStackifyLogging();
            }

            return logConfig.WriteTo.Stackify();
        }

        private static LoggerConfiguration WriteToElasticSearchCustom(this LoggerConfiguration logConfig)
        {
            // get logging config for ES endpoint (re-use some stackify settings for now)
            var loggingSection = _configuration.GetSection("Stackify");

            var esUrl = loggingSection.GetValue<string>("ElasticUrl");

            // only continue if a valid http url is setup in the config
            if (esUrl == null || !esUrl.StartsWith("http"))
            {
                return logConfig;
            }

            logConfig.Enrich.WithProperty("Application", loggingSection.GetValue<string>("AppName"));
            logConfig.Enrich.WithProperty("AppEnvironment", loggingSection.GetValue<string>("Environment"));

            return logConfig.WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(esUrl)) {
                IndexFormat = "aspnet-peaks-{0:yyyy.MM}"
            });
        }
    }

    public class LogUserNameMiddleware
    {
        private readonly RequestDelegate next;

        public LogUserNameMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            using (LogContext.PushProperty("User", context.User.Identity.Name ?? "anonymous"))
            {
                await next(context);
            }
        }
    }
}
