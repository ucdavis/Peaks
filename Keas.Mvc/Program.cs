using System;
using System.Diagnostics;
using Elastic.Apm.SerilogEnricher;
using Keas.Core.Data;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Sinks.Elasticsearch;
using StackifyLib;

namespace Keas.Mvc
{
    public class Program
    {
        public static int Main(string[] args)
        {
#if DEBUG
            Serilog.Debugging.SelfLog.Enable(msg => Debug.WriteLine(msg));
#endif
            // Work-around for catch-all bug in routing
            // See: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-3.1#route-template-reference
            AppContext.SetSwitch("Microsoft.AspNetCore.Routing.UseCorrectCatchAllBehavior", true);

            var isDevelopment = string.Equals(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"), "development", StringComparison.OrdinalIgnoreCase);
            var builder = new ConfigurationBuilder()
                .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);                

            //only add secrets in development
            if (isDevelopment)
            {
                builder.AddUserSecrets<Program>();
            }

            builder.AddEnvironmentVariables();

            var configuration = builder.Build();
            Log.Logger = CreateLogConfig(configuration).CreateLogger();

            try
            {
                var host = CreateHostBuilder(args).Build();

                using (var scope = host.Services.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var superuserSetting = scope.ServiceProvider.GetRequiredService<IOptions<SuperuserSettings>>();
                    var dbInitilizer = new DbInitializer(dbContext, superuserSetting);
                    dbInitilizer.Initialize();
                }

                host.Run();
                return 0; // indicate normal termination
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Unexpected error - application terminating");
                return 1; // indicate abnormal termination
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        static LoggerConfiguration CreateLogConfig(IConfigurationRoot configuration)
        {
            configuration.ConfigureStackifyLogging();
            var loggingSection = configuration.GetSection("Stackify");
            var esUrl = loggingSection.GetValue<string>("ElasticUrl");

            var logConfig = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                // .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning) // uncomment this to hide EF core general info logs
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .Enrich.WithElasticApmCorrelationInfo()
                .Enrich.FromLogContext()
                .Enrich.WithClientIp()
                .Enrich.WithClientAgent()
                .Enrich.WithExceptionDetails()
                .WriteTo.Console();

            if (esUrl?.StartsWith("http") ?? false)
            {
                logConfig = logConfig.Enrich.WithProperty("Application", loggingSection.GetValue<string>("AppName"))
                    .Enrich.WithProperty("AppEnvironment", loggingSection.GetValue<string>("Environment"))
                    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(esUrl))
                    {
                        IndexFormat = "aspnet-peaks-{0:yyyy.MM}",
                        TypeName = null
                    });
            }

            return logConfig;
        }

    }
}
