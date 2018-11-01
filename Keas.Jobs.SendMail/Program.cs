
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
            Console.WriteLine("Beginning Email Job!");

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
            Console.WriteLine($"Notifications Sent {counter}");
            Console.WriteLine("Staring Expiry Notifications");

            // Email persons with expiring items, cc teammembers as needed
            counter = 0;

            var betterModel = new ExpiringItemsEmailModel();
            betterModel.AccessAssignments = dbContext.AccessAssignments.Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).Include(a => a.Access).Include(a => a.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            betterModel.Keys = dbContext.Serials.Where(a => a.Assignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.Assignment.NextNotificationDate == null || a.Assignment.NextNotificationDate <= DateTime.UtcNow)).Include(k => k.Key).Include(k => k.Assignment).ThenInclude(k => k.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            betterModel.Equipment = dbContext.Equipment.Where(a => a.Assignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.Assignment.NextNotificationDate == null || a.Assignment.NextNotificationDate <= DateTime.UtcNow)).Include(e => e.Assignment).ThenInclude(e => e.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            betterModel.Workstations = dbContext.Workstations.Where(a => a.Assignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.Assignment.NextNotificationDate == null || a.Assignment.NextNotificationDate <= DateTime.UtcNow)).Include(w => w.Assignment).ThenInclude(w => w.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();

            var personIds = betterModel.GetPersonIdList();

            betterModel.People = dbContext.People.Where(a => personIds.Contains(a.Id)).Include(a => a.Team).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            Console.WriteLine($"About to write {personIds.Count} Expiry Emails");

            if (betterModel.GetPersonIdList().Any())
            {
                foreach (var personId in personIds)
                {
                    // TODO: build new service method to handle these emails
                    EmailService.SendExpiringMessage(personId, betterModel).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            Console.WriteLine($"Expiring Sent {counter}");

            Console.WriteLine("Done Email Job");
        }
    }
}
