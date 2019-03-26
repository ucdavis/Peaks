using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Keas.Core.Domain;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RazorLight;
using Serilog;
using SparkPost;

namespace Keas.Core.Services
{
    public interface IEmailService
    {
        Task SendNotificationMessage(User user);
        Task SendExpiringMessage(int personId, ExpiringItemsEmailModel model);

        Task SendTeamExpiringMessage(int teamId, ExpiringItemsEmailModel model);

        Task SendPersonNotification();
    }

    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _dbContext;

        private readonly SparkpostSettings _emailSettings;

        public EmailService(ApplicationDbContext dbContext, IOptions<SparkpostSettings> emailSettings)
        {
            _dbContext = dbContext;
            _emailSettings = emailSettings.Value;
        }

        public async Task SendTeamExpiringMessage(int teamId, ExpiringItemsEmailModel model)
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }

            var person = model.People.First(a => a.TeamId == teamId);

            var expiringItems = ExpiringItemsEmailModel.Create(
                model.AccessAssignments.Where(a => a.Access.TeamId == teamId).ToList(),
                model.KeySerials.Where(a => a.KeySerialAssignment != null && a.TeamId == teamId).ToList(),
                model.Equipment.Where(a => a.Assignment != null && a.TeamId == teamId).ToList(),
                model.Workstations.Where(a => a.Assignment != null && a.TeamId == teamId).ToList(),
                person
            );

            if (!expiringItems.AccessAssignments.Any() && !expiringItems.KeySerials.Any() && !expiringItems.Equipment.Any() && !expiringItems.Workstations.Any())
            {
                return;                
            }

            var toUsers = await _dbContext.TeamPermissions.Where(
                t => t.TeamId == teamId && 
                ((t.Role.Name == Role.Codes.DepartmentalAdmin) || 
                (t.Role.Name == Role.Codes.KeyMaster && expiringItems.KeySerials.Any()) ||
                (t.Role.Name == Role.Codes.AccessMaster && expiringItems.AccessAssignments.Any()) || 
                (t.Role.Name == Role.Codes.EquipmentMaster && expiringItems.Equipment.Any()) || 
                (t.Role.Name == Role.Codes.SpaceMaster && expiringItems.Workstations.Any()))).Select(t => t.User).ToListAsync();

            var toEmails = toUsers
                 .Distinct()
                 .Select(u => new Recipient() { Address = new Address(u.Email, u.Name, "to") })
                 .ToList();

            // Build list of people to email. I.E. get all DeptAdmin, if access.any then add AccessMaster, etc.
            var transmission = new Transmission();
            transmission.Content.Subject = "PEAKS Admin Expiring Items Notification";
            transmission.Content.From = new Address("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification");
            transmission.Content.Text = "Your team has asset assignments that are expiring. Please visit https://peaks.ucdavis.edu to review them.";
#if DEBUG
            transmission.Recipients.Add(new Recipient() { Address = new Address("jscubbage@ucdavis.edu") });
#else
            toEmails.ForEach(transmission.Recipients.Add);
#endif


            var engine = GetRazorEngine();
            transmission.Content.Html = await engine.CompileRenderAsync("/EmailTemplates/_ExpiringTeam.cshtml", expiringItems);

            var client = GetSparkpostClient();
            var result = await client.Transmissions.Send(transmission);

            // reset next notification date
            // TODO Do we need a team level notification date????
            // var team = await _dbContext.Teams.FirstAsync(a => a.Id == teamId);
            // team.NextNotificationDate = DateTime.Now.AddDays(1);
            // _dbContext.Teams.Update(team);
            // await _dbContext.SaveChangesAsync();
            

        }

        public async Task SendPersonNotification()
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }

            var personEmails = await _dbContext.PersonNotifications.Where(a => a.Pending && a.SendEmail).AsNoTracking().Select(a => a.NotificationEmail).Distinct().ToArrayAsync();
            if (!personEmails.Any())
            {
                Log.Information("No Person Notifications to Send");
                return;
            }

            var dateSent = DateTime.UtcNow;

            Log.Information($"About to send {personEmails.Length} Person Notification Emails");

            foreach (var personEmail in personEmails)
            {
                //Get the notifications to send to this user.                
                var personNotifications = await _dbContext.PersonNotifications.Where(a => a.Pending && a.NotificationEmail == personEmail).Include(a => a.Team).OrderBy(a => a.TeamId).ThenBy(a => a.ActionDate).GroupBy(a => a.TeamId).ToListAsync();
                
                //Send the Email
                Log.Information($"Sending person notification email to {personEmail}");
                
                var transmission = new Transmission();
                transmission.Content.Subject = "PEAKS People Notification";
                transmission.Content.From = new Address("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification");
                transmission.Content.Text = "The people in your teams have changed"; //TODO: Point to a report?

                transmission.Recipients = new List<Recipient>()
                {
#if DEBUG
                    new Recipient() {Address = new Address("jsylvestre@ucdavis.edu")},
#else
                    new Recipient() { Address = new Address(personEmail) },
#endif
                };

                var engine = GetRazorEngine();
                transmission.Content.Html = await engine.CompileRenderAsync("/EmailTemplates/_Notification-person.cshtml", personNotifications);

                var client = GetSparkpostClient();
                try
                {
                    var result = await client.Transmissions.Send(transmission);
                }
                catch (Exception e)
                {
                    Log.Error(e.Message);
                    continue;
                }
                


                foreach (IGrouping<int?, PersonNotification> notificationGroup in personNotifications)
                {
                    foreach (var personNotification in notificationGroup)
                    {
                        personNotification.Pending = false;
                        personNotification.NotificationDate = dateSent;
                        _dbContext.Update(personNotification);
                    }
                }

                Log.Information("Finished person notification email send");

            }

            await _dbContext.SaveChangesAsync();

            return;
        }

        public async Task SendExpiringMessage(int personId, ExpiringItemsEmailModel model)
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }
            var person = model.People.Single(a => a.Id == personId);

            // build model
            var expiringItems = ExpiringItemsEmailModel.Create(
                model.AccessAssignments.Where(a => a.PersonId == personId).ToList(), 
                model.KeySerials.Where(a => a.KeySerialAssignment != null && a.KeySerialAssignment.PersonId == personId).ToList(), 
                model.Equipment.Where(a => a.Assignment != null && a.Assignment.PersonId == personId).ToList(), 
                model.Workstations.Where(a => a.Assignment != null && a.Assignment.PersonId == personId).ToList(),
                person);
            
            if (!expiringItems.AccessAssignments.Any() && !expiringItems.KeySerials.Any() && !expiringItems.Equipment.Any() && !expiringItems.Workstations.Any())
            {
                return;                
            }
           
            // build email
            var transmission = new Transmission();
            transmission.Content.Subject = "PEAKS Expiring Items";
            transmission.Content.From = new Address("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification");
            transmission.Content.Text = BuildExpiringTextMessage(expiringItems);
            transmission.Recipients = new List<Recipient>()
            {
#if DEBUG
                new Recipient() { Address = new Address("jscubbage@ucdavis.edu") },
#else
                new Recipient() { Address = new Address(person.Email, person.Name) },
#endif            
            };

            // TODO: Email supervisor?
            
            // build cc list
//             var ccUsers = new List<User>();

//             if (expiringItems.AccessAssignments.Any())
//             {
//                 var roles = await _dbContext.Roles
//                     .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
//                 var users = await GetUsersInRoles(roles, person.TeamId);
//                 ccUsers.AddRange(users);
//             }

//             if (expiringItems.KeySerials.Any())
//             {
//                 var roles = await _dbContext.Roles
//                     .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
//                 var users = await GetUsersInRoles(roles, person.TeamId);
//                 ccUsers.AddRange(users);
//             }

//             if (expiringItems.Equipment.Any())
//             {
//                 var roles = await _dbContext.Roles
//                     .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
//                 var users = await GetUsersInRoles(roles, person.TeamId);
//                 ccUsers.AddRange(users);
//             }

//             if (expiringItems.Workstations.Any())
//             {
//                 var roles = await _dbContext.Roles
//                     .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
//                 var users = await GetUsersInRoles(roles, person.TeamId);
//                 ccUsers.AddRange(users);
                
//             }

//             // transform to cc recipient
//             var ccEmails = ccUsers
//                 .Distinct()
//                 .Select(u => new Recipient() {Address = new Address(u.Email, u.Name, "cc")})
//                 .ToList();

// #if !DEBUG
//             // add emails to
//             ccEmails.ForEach(transmission.Recipients.Add);
// #endif

            // build view
            var engine = GetRazorEngine();
            transmission.Content.Html = await engine.CompileRenderAsync("/EmailTemplates/_Expiring.cshtml", expiringItems);

            var client = GetSparkpostClient();
            var result = await client.Transmissions.Send(transmission);

            // reset next notification date
            foreach (var assignment in expiringItems.KeySerials.Select(k => k.KeySerialAssignment))
            {
                SetNextNotification(assignment);
                _dbContext.KeySerialAssignments.Update(assignment);
            }

            foreach (var assignment in expiringItems.Equipment.Select(k => k.Assignment))
            {
                SetNextNotification(assignment);
                _dbContext.EquipmentAssignments.Update(assignment);
            }

            foreach (var assignment in expiringItems.Workstations.Select(k => k.Assignment))
            {
                SetNextNotification(assignment);
                _dbContext.WorkstationAssignments.Update(assignment);
            }

            foreach (var assignment in expiringItems.AccessAssignments)
            {
                SetNextNotification(assignment);
                _dbContext.AccessAssignments.Update(assignment);
            }

            await _dbContext.SaveChangesAsync();
        }

        private string BuildExpiringTextMessage(ExpiringItemsEmailModel expiringItems)
        {
            var message = new StringBuilder();
            var count = expiringItems.KeySerials.Count() + expiringItems.Equipment.Count() + expiringItems.Workstations.Count() + expiringItems.AccessAssignments.Count();
            var helplink = "https://peaks.ucdavis.edu/" + expiringItems.Person.Team.Slug +"/Help";

            var plural = "item";
            if (count > 1)
            {
                plural = "items";
            }

            message.AppendLine($"{expiringItems.Person.Name}, you have {count} expiring {plural} in team {expiringItems.Person.Team.Name} in PEAKS.");
            message.AppendLine("Thanks for PEAKing at this email. It sPEAKS well of you.");
            message.AppendLine();
            message.AppendLine("Notification Details");
            message.AppendLine("Type, Item, Date expiring");
            foreach (var item in expiringItems.AccessAssignments)
            {
                message.AppendLine($"Access, {item.Access.Name}, {item.ExpiresAt.ToPacificTime():d}");
            }
            foreach (var item in expiringItems.KeySerials)
            {
                message.AppendLine($"Key, {item.Key.Title}, {item.KeySerialAssignment.ExpiresAt.ToPacificTime():d}");
            }
            foreach (var item in expiringItems.Equipment)
            {
                message.AppendLine($"Equipment, {item.Name}, {item.Assignment.ExpiresAt.ToPacificTime():d}");
            }
            foreach (var item in expiringItems.Workstations)
            {
                message.AppendLine($"Workstation, {item.Name}, {item.Assignment.ExpiresAt.ToPacificTime():d}");
            }

            message.AppendLine();
            message.AppendLine("Please contact your team's assigned individuals to either update the expiration date or return/check-in the above items.");
            message.AppendLine();

            message.AppendLine("Not sure who that is? Click Help. To see your team's Admins");
            message.AppendLine($"Help link for this team: {helplink}");

            message.AppendLine();
            message.AppendLine("This email was automatically generated please do not reply to it as the mailbox is not monitored.");
            return message.ToString();
        }
        private string BuildNotificationTextMessage(List<IGrouping<int?, Notification>> notifications)
        {
            var message = new StringBuilder();
            var userName = notifications.First().First(a => a.User != null).User.Name;
            var tempCount = notifications.Sum(a => a.Count());
            var notificationPluralize = "notification";
            if (tempCount > 1)
            {
                notificationPluralize = "notifications";
            }

            message.AppendLine($"{userName}, you have {tempCount} new {notificationPluralize} from PEAKS.");
            message.AppendLine("Thanks for PEAKing at this email. It sPEAKS well of you.");
            message.AppendLine();
            message.AppendLine("Notification Details");
            foreach (IGrouping<int?, Notification> notificationGroup in notifications)
            {
                var teamName = "Not Set";
                var link = "https://peaks.ucdavis.edu/";
                if (notificationGroup.Key != null)
                {
                    teamName = notificationGroup.First().Team.Name;
                    link = "https://peaks.ucdavis.edu/" + notificationGroup.First().Team.Slug + "/Confirm/Confirm";
                }

                message.AppendLine($"Team: {teamName}");
                if (notificationGroup.Any(n => n.NeedsAccept))
                {
                    message.AppendLine("One or more items in this team require you to accept them. Please click on the link below to confirm receiving these items.");
                    message.AppendLine($"Link to confirm: {link}");
                }

                message.AppendLine("Details, Date Created");
                foreach (var notification in notificationGroup)
                {
                    message.AppendLine($"{notification.Details}, {notification.DateTimeCreated.ToPacificTime():g}");
                }
            }
            
            message.AppendLine();
            message.AppendLine("This email was automatically generated please do not reply to it as the mailbox is not monitored.");
            return message.ToString();
        }

        private void SetNextNotification(AssignmentBase assignment)
        {
            // first notification, push back one week before expiration
            if (assignment.NextNotificationDate == null || assignment.ExpiresAt > DateTime.UtcNow.Date.AddDays(7))
            {
                assignment.NextNotificationDate = assignment.ExpiresAt.AddDays(-7);
                //If this sets it to less than the current date/time, set it to tomorrow to avoid a second email right away.
                if (assignment.NextNotificationDate <= DateTime.UtcNow)
                {
                    assignment.NextNotificationDate = DateTime.UtcNow.Date.AddDays(1);
                }
                return;
            }

            // second notification, push back one day before expiration
            if (assignment.ExpiresAt > DateTime.UtcNow.AddDays(1))
            {
                assignment.NextNotificationDate = assignment.ExpiresAt.AddDays(-1);
                return;
            }

            // otherwise push back to tomorrow
            assignment.NextNotificationDate = DateTime.UtcNow.Date.AddDays(1);
        }

        public async Task SendNotificationMessage(User user)
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }

            var notifications = _dbContext.Notifications.Where(a => a.Pending && a.User == user).Include(a => a.Team).Include(a => a.User).OrderBy(a => a.TeamId).ThenBy(a => a.DateTimeCreated).GroupBy(a => a.TeamId).ToArray();
            if (!notifications.Any())
            {
                return;
            }

            //TODO: Do something with these notifications to build them into a single email.

            // build email
            var transmission = new Transmission();
            transmission.Content.Subject = "PEAKS Notification";
            transmission.Content.From = new Address("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification");
            transmission.Content.Text = BuildNotificationTextMessage(notifications.ToList());
            transmission.Recipients = new List<Recipient>()
            {
#if DEBUG
                new Recipient() { Address = new Address("jscubbage@ucdavis.edu") },
#else
                new Recipient() { Address = new Address(user.Email, user.Name) },
#endif
            };

            //Bcc anyone?

            var engine = GetRazorEngine();
            transmission.Content.Html = await engine.CompileRenderAsync("/EmailTemplates/_Notification.cshtml", notifications.ToList());

            var client = GetSparkpostClient();
            var result = await client.Transmissions.Send(transmission);

            foreach (var notificationGroup in notifications)
            {
                foreach (var notification in notificationGroup)
                {
                    notification.Pending = false;
                    notification.DateTimeSent = DateTime.UtcNow;
                    _dbContext.Notifications.Update(notification);                
                }
            }

            await _dbContext.SaveChangesAsync();
        }

        private async Task<List<User>> GetUsersInRoles(IReadOnlyCollection<Role> roles, int teamId)
        {
            var users = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == teamId && roles.Any(r => r.Id == x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .ToListAsync();

            return users;
        }

        private RazorLightEngine GetRazorEngine()
        {
            var path = Path.GetFullPath(".");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();

            return engine;
        }

        private Client GetSparkpostClient()
        {
            var client = new Client(_emailSettings.ApiKey);
            return client;
        }
    }
}
