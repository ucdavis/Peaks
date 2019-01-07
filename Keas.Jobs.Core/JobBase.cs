using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace Keas.Jobs.Core
{
    public abstract class JobBase
    {
        public static IConfigurationRoot Configuration { get; set; }

        protected static void Configure()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json");

            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            if (string.Equals(environmentName, "development", StringComparison.OrdinalIgnoreCase))
            {
                builder.AddUserSecrets<JobBase>();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            LogConfiguration.Setup(Configuration);
        }
    }
}
