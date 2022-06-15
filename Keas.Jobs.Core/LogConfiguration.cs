using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Sinks.Elasticsearch;
using StackifyLib;

namespace Keas.Jobs.Core
{
    public static class LogConfiguration
    {
        private static bool _loggingSetup;

        public static void Setup(IConfigurationRoot configuration)
        {
            if (_loggingSetup) return;

            // save configuration for later calls
            if (configuration == null)
            {
                throw new ArgumentNullException(nameof(configuration));
            }

            // create global logger with standard configuration
            Log.Logger = CreateLogConfig(configuration).CreateLogger();

            AppDomain.CurrentDomain.UnhandledException += (sender, e) => Log.Fatal(e.ExceptionObject as Exception, e.ExceptionObject.ToString());

            AppDomain.CurrentDomain.ProcessExit += (sender, e) => Log.CloseAndFlush();

#if DEBUG
            Serilog.Debugging.SelfLog.Enable(msg => Debug.WriteLine(msg));
#endif

            _loggingSetup = true;
        }

        static LoggerConfiguration CreateLogConfig(IConfigurationRoot configuration)
        {
            configuration.ConfigureStackifyLogging();
            var loggingSection = configuration.GetSection("Stackify");
            var esUrl = loggingSection.GetValue<string>("ElasticUrl");

            var logConfig = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                // .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning) // uncomment this to hide EF core general info logs
                .Enrich.FromLogContext()
                .Enrich.WithExceptionDetails()
                .WriteTo.Console();

            if (esUrl != null && esUrl.StartsWith("http"))
            {
                logConfig = logConfig.Enrich.WithProperty("Application", loggingSection.GetValue<string>("AppName"))
                    .Enrich.WithProperty("AppEnvironment", loggingSection.GetValue<string>("Environment"))
                    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(esUrl))
                    {
                        IndexFormat = "aspnet-peaks-{0:yyyy.MM}"
                    });
            }

            return logConfig;
        }
    }
}
