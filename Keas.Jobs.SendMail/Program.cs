
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
using Keas.Jobs.Core;
using Serilog;

namespace Keas.Jobs.SendMail
{
    public class Program : JobBase
    {
        private static ILogger _log;

        static void Main(string[] args)
        {
            Configure();

            var assembyName = typeof(Program).Assembly.GetName();
            _log = Log.Logger
                .ForContext("jobname", assembyName.Name)
                .ForContext("jobid", Guid.NewGuid());

            _log.Information("Running {job} build {build}", assembyName.Name, assembyName.Version);

            // setup di
            var provider = ConfigureServices();
            var dbContext = provider.GetService<ApplicationDbContext>();
            var emailService = provider.GetService<IEmailService>();

            //TODO: db stuff 
            var counter = 0;
            var usersWithPendingNotifications = dbContext.Notifications.Where(a => a.Pending).Select(s => s.User).Distinct().ToArray();
            if (usersWithPendingNotifications.Any())
            {
                foreach (var user in usersWithPendingNotifications)
                {
                    emailService.SendNotificationMessage(user).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            _log.Information("Notifications Sent {counter}", counter);
            _log.Information("Staring Expiry Notifications");

            // Email persons with expiring items, cc teammembers as needed
            counter = 0;

            var expiringItems = new ExpiringItemsEmailModel();
            expiringItems.AccessAssignments = dbContext.AccessAssignments.Where(a => a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).Include(a => a.Access).Include(a => a.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            expiringItems.KeySerials = dbContext.KeySerials.Where(a => a.KeySerialAssignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.KeySerialAssignment.NextNotificationDate == null || a.KeySerialAssignment.NextNotificationDate <= DateTime.UtcNow)).Include(k => k.Key).Include(k => k.KeySerialAssignment).ThenInclude(k => k.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            expiringItems.Equipment = dbContext.Equipment.Where(a => a.Assignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.Assignment.NextNotificationDate == null || a.Assignment.NextNotificationDate <= DateTime.UtcNow)).Include(e => e.Assignment).ThenInclude(e => e.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            expiringItems.Workstations = dbContext.Workstations.Where(a => a.Assignment.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.Assignment.NextNotificationDate == null || a.Assignment.NextNotificationDate <= DateTime.UtcNow)).Include(w => w.Assignment).ThenInclude(w => w.Person).AsNoTracking().ToListAsync().GetAwaiter().GetResult();

            var personIds = expiringItems.GetPersonIdList();

            expiringItems.People = dbContext.People.Where(a => personIds.Contains(a.Id)).Include(a => a.Team).AsNoTracking().ToListAsync().GetAwaiter().GetResult();
            _log.Information("About to write {count} Expiry Emails", personIds.Count);

            if (personIds.Any())
            {
                foreach (var personId in personIds)
                {
                    // TODO: build new service method to handle these emails
                    emailService.SendExpiringMessage(personId, expiringItems).GetAwaiter().GetResult(); //TODO: Pass param?
                    counter++;
                }
            }
            _log.Information("Expiring Sent {count}", counter);

            _log.Information("Done Email Job");
        }

        private static ServiceProvider ConfigureServices()
        {
            IServiceCollection services = new ServiceCollection();
            services.AddOptions();
            services.AddDbContextPool<ApplicationDbContext>(o => o.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddTransient<IEmailService, EmailService>();
            services.Configure<SparkpostSettings>(Configuration.GetSection("Sparkpost"));

            return services.BuildServiceProvider();
        }
    }
}
