using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Keas.Core.Domain;
using System.Net;
using System.Net.Mail;
using Keas.Core.Data;
using Keas.Core.Models;
using Microsoft.Extensions.Options;

namespace Keas.Core.Services
{
    public interface IEmailService
    {
        void SendMessage(User user);
    }

    public class EmailService : IEmailService
    {
        //private readonly ApplicationDbContext _dbContext;
        private readonly EmailSettings _emailSettings;

        //public EmailService(ApplicationDbContext dbContext, IOptions<EmailSettings> emailSettings)
        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            //_dbContext = dbContext;
            _emailSettings = emailSettings.Value;
        }
        public void SendMessage(User user)
        {
            //var notifications = _dbContext.Notifications.Where(a => a.User == user && a.Pending).ToArray();
            //TODO: Do something with these notifications to build them into a single email.

            var message = new System.Net.Mail.MailMessage { From = new MailAddress("keas-notification@ucdavis.edu", "Keas - No Reply") };
            //message.To.Add(user.Email);
            message.To.Add("jsylvestre@ucdavis.edu");

            //Bcc anyone?

            message.Subject = "Keas Notification";
            message.IsBodyHtml = false;
            message.Body = "<p>Hello World!</p>"; //Ok, so the ViewrenderService is in the MVC project. I don't think I can call it here... In other projects we almost always store the email in a table and just loop through that here...
            var mimeType = new System.Net.Mime.ContentType("text/html");

            var alternate = AlternateView.CreateAlternateViewFromString(message.Body, mimeType);
            message.AlternateViews.Add(alternate);

            using (var client = new SmtpClient(_emailSettings.Host))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_emailSettings.UserName, _emailSettings.Password);
                client.Port = _emailSettings.Port;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.EnableSsl = true;

                client.Send(message);
            }
        }
    }
}
