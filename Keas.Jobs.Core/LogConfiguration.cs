using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Exceptions;
using StackifyLib;

namespace Keas.Jobs.Core
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
                .Enrich.FromLogContext()
                .Enrich.WithExceptionDetails();

            // various sinks
            logConfig = logConfig
                .WriteTo.Console()
                .WriteToStackifyCustom();

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
    }
}
