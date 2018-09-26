
using System;
using System.IO;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Helper;
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
                    EmailService.SendNotificationMessage(user).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            Console.WriteLine($"Done! Sent {counter}");


            // Email persons with expiring items, cc teammembers as needed
            counter = 0;
            var personsWithExpiringAccess = dbContext.AccessAssignments
                .Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow))
                .Select(s => s.Person).Include(p=> p.Team).Distinct().AsNoTracking().ToList();
            var personsWithExpiringKey = dbContext.KeyAssignments
                .Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow))
                .Select(s => s.Person).Include(p => p.Team).Distinct().AsNoTracking().ToList();
            var personsWithExpiringEquipment = dbContext.EquipmentAssignments
                .Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow))
                .Select(s => s.Person).Include(p => p.Team).Distinct().AsNoTracking().ToList();
            var personsWithExpiringWorkstations = dbContext.WorkstationAssignments
                .Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow))
                .Select(s => s.Person).Include(p => p.Team).Distinct().AsNoTracking().ToList();
            var personsWithExpiringItems = personsWithExpiringAccess.Union(personsWithExpiringKey, new PersonComparer()).Union(personsWithExpiringEquipment, new PersonComparer()).Union(personsWithExpiringWorkstations, new PersonComparer());

            if (personsWithExpiringItems.Any())
            {
                foreach (var person in personsWithExpiringItems)
                {
                    // TODO: build new service method to handle these emails
                    EmailService.SendExpiringMessage(person).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            Console.WriteLine($"Done! Sent {counter}");


        }
    }
}
