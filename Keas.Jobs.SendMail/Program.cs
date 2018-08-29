﻿
using System;
using System.IO;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Keas.Core.Services;

namespace Keas.Jobs.SendMail
{
    public class Program
    {
        public static IConfigurationRoot Configuration { get; set; }
        public static IServiceProvider Provider { get; set; }

        public static IEmailService EmailService { get; set; }
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");

            // Use this to get configuration info, environmental comes in from azure
            var builder = new ConfigurationBuilder()
               .SetBasePath(Directory.GetCurrentDirectory())
               .AddJsonFile("appsettings.json");
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (string.Equals(environmentName, "development", StringComparison.OrdinalIgnoreCase))
            {
                builder.AddUserSecrets<Program>();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            //TODO: Logging
            //LogHelper.ConfigureLogging(Configuration);
            //var assembyName = typeof(Program).Assembly.GetName();
            //Log.Information("Running {job} build {build}", assembyName.Name, assembyName.Version);

            IServiceCollection services = new ServiceCollection();
            services.AddOptions();
            services.AddDbContextPool<ApplicationDbContext>(o => o.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
            



            services.AddTransient<IEmailService, EmailService>();
            services.Configure<EmailSettings>(Configuration.GetSection("Email"));

            Provider = services.BuildServiceProvider();
            EmailService = Provider.GetService<IEmailService>();

            //TODO: db stuff 
            var dbContext = Provider.GetService<ApplicationDbContext>();
            var counter = 0;
            var usersWithPendingNotifications = dbContext.Notifications.Where(a => a.Pending).Select(s => s.User).Distinct().ToArray();
            if (usersWithPendingNotifications.Any())
            {
                foreach (var user in usersWithPendingNotifications)
                {
                    EmailService.SendMessage(user).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            Console.WriteLine($"Done! Sent {counter}");

        }
    }
}
