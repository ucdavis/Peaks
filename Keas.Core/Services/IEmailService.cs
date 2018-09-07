using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Keas.Core.Domain;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Models;
using Microsoft.Extensions.Options;
using RazorLight;

namespace Keas.Core.Services
{
    public interface IEmailService
    {
        Task SendNotificationMessage(User user);
        Task SendExpiringMessage(Person person);
    }

    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly EmailSettings _emailSettings;

        public EmailService(ApplicationDbContext dbContext, IOptions<EmailSettings> emailSettings)
        //public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _dbContext = dbContext;
            _emailSettings = emailSettings.Value;
        }

        private async Task SendMessage(MailMessage message)
        {
            using (var client = new SmtpClient(_emailSettings.Host))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_emailSettings.UserName, _emailSettings.Password);
                client.Port = _emailSettings.Port;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.EnableSsl = true;

                await client.SendMailAsync(message);
            }
        }

        public async Task SendExpiringMessage(Person person)
        {
            var path = Path.GetFullPath(".");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();
            var expiringAccess = _dbContext.AccessAssignments.Where(a => a.Person==person && a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).ToList();
            var expiringKey = _dbContext.KeyAssignments.Where(a => a.Person==person && a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).ToList();
            var expiringEquipment = _dbContext.EquipmentAssignments.Where(a => a.Person==person && a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).ToList();
            var expiringWorkstations = _dbContext.WorkstationAssignments.Where(a => a.Person==person && a.ExpiresAt <= DateTime.UtcNow.AddDays(30) && (a.NextNotificationDate == null || a.NextNotificationDate <= DateTime.UtcNow)).ToList();
            var expiringItems = ExpiringItemsEmailModel.Create(expiringAccess, expiringKey, expiringEquipment, expiringWorkstations);

            if (expiringItems.KeyAssignments.Count == 0 && expiringItems.AccessAssignments.Count == 0 &&
                expiringItems.EquipmentAssignments.Count == 0 && expiringItems.WorkstationAssignments.Count == 0)
            {
                return;                
            }

            var message = new System.Net.Mail.MailMessage { From = new MailAddress("keas-notification@ucdavis.edu", "Keas - No Reply") };
            //message.To.Add(person.Email);
            message.To.Add("jscubbage@ucdavis.edu");

            //CC team members

            message.Subject = "Keas Notification";
            message.IsBodyHtml = false;

        }

        public async Task SendNotificationMessage(User user)
        {
            var path = Path.GetFullPath(".");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();
            var notifications = _dbContext.Notifications.Where(a => a.Pending && a.User == user).ToArray();
            if (notifications.Length <= 0)
            {
                return;
            }
            //TODO: Do something with these notifications to build them into a single email.

            var message = new System.Net.Mail.MailMessage { From = new MailAddress("keas-notification@ucdavis.edu", "Keas - No Reply") };
            //message.To.Add(user.Email);
            message.To.Add("jscubbage@ucdavis.edu");

            //Bcc anyone?

            message.Subject = "Keas Notification";
            message.IsBodyHtml = false;


            try
            {
                message.Body = await engine.CompileRenderAsync("/EmailTemplates/_Notification.cshtml", notifications.ToList());            
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                throw;
            }

            foreach (var notification in notifications)
            {
                notification.Pending = false;
                notification.DateTimeSent = DateTime.UtcNow;
                _dbContext.Notifications.Update(notification);                
            }
            await _dbContext.SaveChangesAsync();

            var mimeType = new System.Net.Mime.ContentType("text/html");

            var alternate = AlternateView.CreateAlternateViewFromString(message.Body, mimeType);
            message.AlternateViews.Add(alternate);

            await SendMessage(message);
        }
    }
}
