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
using Razor.Templating.Core;
using Serilog;
using System.Net.Mail;
using System.Net.Mime;
// avoid conflict with types in System.Net.Mime
using MjMl = Mjml.Net;

namespace Keas.Core.Services
{
    public interface IEmailService
    {
        Task SendNotificationMessage(User user);
        Task SendSampleNotificationMessage();
        Task SendExpiringMessage(int personId, ExpiringItemsEmailModel model);
        Task SendSampleExpiringMessage();
        Task SendSampleTeamExpiringMessage();
        Task SendTeamExpiringMessage(int teamId, ExpiringItemsEmailModel model);
        Task SendSamplePersonNotification();
        Task SendPersonNotification();
    }

    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _dbContext;

        private readonly SparkpostSettings _emailSettings;

        private readonly SmtpClient _client;

        private readonly MjMl.IMjmlRenderer _mjmlRenderer;

        public EmailService(ApplicationDbContext dbContext, IOptions<SparkpostSettings> emailSettings, MjMl.IMjmlRenderer mjmlRenderer)
        {
            _dbContext = dbContext;
            _emailSettings = emailSettings.Value;
            _mjmlRenderer = mjmlRenderer;
            _client = new SmtpClient(_emailSettings.Host, _emailSettings.Port) { Credentials = new NetworkCredential(_emailSettings.UserName, _emailSettings.Password), EnableSsl = true };
        }

        public async Task SendSampleTeamExpiringMessage()
        {
            var toEmails = new MailAddress[] {
                new MailAddress("notifyme@ucdavis.edu", "User PEAKS")
            }.ToList();
            var expiringItems = new ExpiringItemsEmailModel
            {
                Equipment = new Equipment[] { new Equipment{
                    Name = "Desktop",
                    Assignment = new EquipmentAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                Workstations = new Workstation[] { new Workstation{
                    Name = "Room",
                    Assignment = new WorkstationAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                KeySerials = new KeySerial[] { new KeySerial{
                    Key = new Key { Code = "Key" },
                    KeySerialAssignment = new KeySerialAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                AccessAssignments = new AccessAssignment[] { new AccessAssignment{
                    Access = new Access { Name = "Access" }
                    }
                }.ToArray(),
                Person = new Person
                {
                    Email = "notifyme@ucdavis.edu",
                    FirstName = "Expire",
                    LastName = "Person",
                    Team = new Team { Id = 1, Name = "Test", Slug = "Slug" }
                }
            };
            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Team Expiration Notification"), Subject = "PEAKS Admin Expiring Items Notification" })
            {
                toEmails.ForEach(message.To.Add);

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = "Your team has asset assignments that are expiring. Please visit https://peaks.ucdavis.edu to review them.";

                var htmlView = await RenderEmail("/Views/_ExpiringTeam.cshtml", expiringItems);
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }
        }

        private async Task<AlternateView> RenderEmail(string view, object model = null)
        {
            var mjml = await RazorTemplateEngine.RenderAsync(view, model);
            var xml = _mjmlRenderer.FixXML(mjml);

            var (html, errors) = _mjmlRenderer.Render(xml);

            if (errors.Any())
            {
                throw new Exception($"Error rendering notification for subject \"{view}\": {string.Join(Environment.NewLine, errors.Select(e => $"{e.Line}:{e.Column} {e.Error}"))}");
            }

            var alternateView = AlternateView.CreateAlternateViewFromString(html, new ContentType(MediaTypeNames.Text.Html));

            return alternateView;
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
                 .Select(u => new MailAddress(u.Email, u.Name))
                 .ToList();

            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS Admin Expiring Items Notification" })
            {
                toEmails.ForEach(message.To.Add);

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = "Your team has asset assignments that are expiring. Please visit https://peaks.ucdavis.edu to review them.";

                var htmlView = await RenderEmail("/Views/_ExpiringTeam.cshtml", expiringItems);
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }
        }

        public async Task SendSamplePersonNotification()
        {
            var personEmails = new PersonNotification[] { new PersonNotification{
                PersonName = "User Peaks",
                PersonEmail = "donotreply@peaks-notify.ucdavis.edu",
                NotificationEmail = "donotreply@peaks-notify.ucdavis.edu",
                Team = new Team { Id = 1, Name = "Test", Slug = "Slug" }
            }
            }.ToArray();

            foreach (var personEmail in personEmails)
            {
                //Get the notifications to send to this user.                
                var personNotifications = new PersonNotification[]
                {
                    new PersonNotification
                    {
                        PersonName = "User Peaks",
                        PersonEmail = "donotreply@peaks-notify.ucdavis.edu",
                        NotificationEmail = "donotreply@peaks-notify.ucdavis.edu",
                        Team = new Team { Id = 1, Name = "Test", Slug = "Slug" },
                        Action = "Added",
                        ActorName = "User Peaks",
                    },
                    new PersonNotification
                    {
                        PersonName = "User Peaks2",
                        PersonEmail = "donotreply@peaks-notify.ucdavis.edu",
                        NotificationEmail = "donotreply@peaks-notify.ucdavis.edu",
                        Team = new Team { Id = 1, Name = "Test", Slug = "Slug" },
                        Action = "Deactivated",
                        ActorName = "User Peaks",
                        Notes = "Some notes"
                    }
                }.GroupBy(a => a.TeamId).ToList();

                using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Person Notification"), Subject = "PEAKS People Notification" })
                {
                    message.To.Add(personEmail.NotificationEmail);

                    // body is our fallback text and we'll add an HTML view as an alternate.
                    message.Body = "The people in your teams have changed";

                    var htmlView = await RenderEmail("/Views/_Notification-person.cshtml", personNotifications);
                    message.AlternateViews.Add(htmlView);

                    try
                    {
                        await _client.SendMailAsync(message);
                    }
                    catch (Exception e)
                    {
                        Log.Error(e.Message);
                        continue;
                    }
                }
            }
        }

        public async Task SendPersonNotification()
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }

            var personEmails = await _dbContext.PersonNotifications.Where(a => a.Pending && a.NotificationEmail != null && a.NotificationEmail != string.Empty).AsNoTracking().Select(a => a.NotificationEmail).Distinct().ToArrayAsync();
            if (!personEmails.Any())
            {
                Log.Information("No Person Notifications to Send");
                return;
            }

            var dateSent = DateTime.UtcNow;

            Log.Information($"About to send {personEmails.Length} Person Notification Emails");

            foreach (var personEmail in personEmails.Where(a => !string.IsNullOrWhiteSpace(a)))
            {
                //Get the notifications to send to this user.                
                var personNotifications = (await _dbContext.PersonNotifications.Where(a => a.Pending && a.NotificationEmail == personEmail).Include(a => a.Team).OrderBy(a => a.TeamId).ThenBy(a => a.ActionDate).ToArrayAsync()).GroupBy(a => a.TeamId).ToList();

                //Send the Email
                Log.Information($"Sending person notification email to {personEmail}");

                using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS People Notification" })
                {
                    message.To.Add(personEmail);

                    // body is our fallback text and we'll add an HTML view as an alternate.
                    message.Body = "The people in your teams have changed";

                    var htmlView = await RenderEmail("/Views/_Notification-person.cshtml", personNotifications);
                    message.AlternateViews.Add(htmlView);

                    try
                    {
                        await _client.SendMailAsync(message);
                    }
                    catch (Exception e)
                    {
                        Log.Error(e.Message);
                        continue;
                    }
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

        public async Task SendSampleExpiringMessage()
        {
            var person = new Person
            {
                Email = "notifyme@ucdavis.edu",
                FirstName = "Expire",
                LastName = "Person",
                Team = new Team { Id = 1, Name = "Test", Slug = "Slug" }
            };
            var expiringItems = new ExpiringItemsEmailModel
            {
                Equipment = new Equipment[] { new Equipment{
                    Name = "Desktop",
                    Assignment = new EquipmentAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                Workstations = new Workstation[] { new Workstation{
                    Name = "Room",
                    Assignment = new WorkstationAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                KeySerials = new KeySerial[] { new KeySerial{
                    Key = new Key { Code = "Key" },
                    KeySerialAssignment = new KeySerialAssignment { ExpiresAt = DateTime.UtcNow }
                    }
                }.ToArray(),
                AccessAssignments = new AccessAssignment[] { new AccessAssignment{
                    Access = new Access { Name = "Access" }
                    }
                }.ToArray(),
                Person = person
            };

            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS Expiring Items" })
            {
                message.To.Add(new MailAddress(person.Email, person.Name));

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = BuildExpiringTextMessage(expiringItems);

                var htmlView = await RenderEmail("/Views/_Expiring.cshtml", expiringItems);
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }
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

            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS Expiring Items" })
            {
                message.To.Add(new MailAddress(person.Email, person.Name));

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = BuildExpiringTextMessage(expiringItems);

                var htmlView = await RenderEmail("/Views/_Expiring.cshtml", expiringItems);
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }

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
                SetNextNotification(assignment, true);
                _dbContext.AccessAssignments.Update(assignment);
            }

            await _dbContext.SaveChangesAsync();
        }

        private string BuildExpiringTextMessage(ExpiringItemsEmailModel expiringItems)
        {
            var message = new StringBuilder();
            var count = expiringItems.KeySerials.Count() + expiringItems.Equipment.Count() + expiringItems.Workstations.Count() + expiringItems.AccessAssignments.Count();
            var helplink = "https://peaks.ucdavis.edu/" + expiringItems.Person.Team.Slug + "/Help";

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

        private void SetNextNotification(AssignmentBase assignment, bool deferOld = false)
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

            //Old notification, older than 30 days set next notification to 1 month away.
            if (deferOld && assignment.ExpiresAt < DateTime.UtcNow.AddDays(-30))
            {
                Log.Information($"Setting Access Assignment to next month. id: {assignment.Id}");
                assignment.NextNotificationDate = DateTime.UtcNow.Date.AddMonths(1);
                return;
            }

            if (assignment.ExpiresAt < DateTime.UtcNow.AddDays(-30))
            {
                Log.Information($"Old ExpiresAt Date. id: {assignment.Id} requested by {assignment.RequestedByName}");
            }

            // otherwise push back to tomorrow
            assignment.NextNotificationDate = DateTime.UtcNow.Date.AddDays(1);
        }

        public async Task SendSampleNotificationMessage()
        {
            var user = new User { Email = "notifyme@ucdavis.edu", FirstName = "Notify", LastName = "Person" };
            var notifications = new Notification[] 
            { 
                new Notification
                {
                    TeamId = 1,
                    User = user,
                    Details = "This is our details",
                    DateTimeCreated = DateTime.UtcNow,
                    Team = new Team { Id = 1, Name = "Test" },
                    NeedsAccept = true
                }
            }.ToArray().GroupBy(g => g.TeamId);

            //TODO: Do something with these notifications to build them into a single email.
            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS Notification" })
            {
                message.To.Add(new MailAddress(user.Email, user.Name));

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = BuildNotificationTextMessage(notifications.ToList());

                var htmlView = await RenderEmail("/Views/_Notification.cshtml", notifications.ToList());
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }
        }

        public async Task SendNotificationMessage(User user)
        {
            if (_emailSettings.DisableSend.Equals("Yes", StringComparison.OrdinalIgnoreCase))
            {
                Log.Information("Email Sending Disabled");
                return;
            }

            var notifications = _dbContext.Notifications.Where(a => a.Pending && a.User == user).Include(a => a.Team).Include(a => a.User).OrderBy(a => a.TeamId).ThenBy(a => a.DateTimeCreated).ToArray().GroupBy(a => a.TeamId);
            if (!notifications.Any())
            {
                return;
            }

            //TODO: Do something with these notifications to build them into a single email.
            using (var message = new MailMessage { From = new MailAddress("donotreply@peaks-notify.ucdavis.edu", "PEAKS Notification"), Subject = "PEAKS Notification" })
            {
                message.To.Add(new MailAddress(user.Email, user.Name));

                // body is our fallback text and we'll add an HTML view as an alternate.
                message.Body = BuildNotificationTextMessage(notifications.ToList());

                var htmlView = await RenderEmail("/Views/_Notification.cshtml", notifications.ToList());
                message.AlternateViews.Add(htmlView);

                await _client.SendMailAsync(message);
            }

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
            var roleIds = roles.Select(r => r.Id).ToArray();

            var users = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == teamId && roleIds.Contains(x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .ToListAsync();

            return users;
        }
    }
}
