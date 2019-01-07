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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RazorLight;

namespace Keas.Core.Services
{
    public interface IEmailService
    {
        Task SendNotificationMessage(User user);
        Task SendExpiringMessage(int personId, ExpiringItemsEmailModel model);
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

        public async Task SendExpiringMessage(int personId, ExpiringItemsEmailModel model)
        {
            var path = Path.GetFullPath(".");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();

            var person = model.People.Single(a => a.Id == personId);

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
           
            var message = new System.Net.Mail.MailMessage { From = new MailAddress("peaks-notify.ucdavis.edu", "PEAKS - No Reply") };
#if DEBUG //Might as well do this here too. In prod real peeps are getting added
            message.To.Add("jsylvestre@ucdavis.edu"); 
#else
            message.To.Add(person.Email);
#endif            
            
            

            if (expiringItems.AccessAssignments.Any())
            {
                var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
                var users = await GetUsersInRoles(roles, person.TeamId);
                foreach (var user in users)
                {
#if DEBUG
                    Console.WriteLine(user.Email);
#else
                    message.CC.Add(user.Email);
#endif
                }
            }

            if (expiringItems.KeySerials.Any())
            {
                var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
                var users = await GetUsersInRoles(roles, person.TeamId);
                foreach (var user in users)
                {
#if DEBUG
                    Console.WriteLine(user.Email);
#else
                    message.CC.Add(user.Email);
#endif
                }
            }

            if (expiringItems.Equipment.Any())
            {
                var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
                var users = await GetUsersInRoles(roles, person.TeamId);
                foreach (var user in users)
                {
#if DEBUG
                    Console.WriteLine(user.Email);
#else
                    message.CC.Add(user.Email);
#endif
                }
            }

            if (expiringItems.Workstations.Any())
            {
                var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
                var users = await GetUsersInRoles(roles, person.TeamId);
                foreach (var user in users)
                {
#if DEBUG
                    Console.WriteLine(user.Email);
#else
                    message.CC.Add(user.Email);
#endif
                }
            }

            message.Subject = "PEAKS Notification";
            message.IsBodyHtml = false;
            try
            {
                message.Body = await engine.CompileRenderAsync("/EmailTemplates/_Expiring.cshtml", expiringItems);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                throw;
            }

            foreach (var key in expiringItems.KeySerials)
            {
                if (key.KeySerialAssignment.NextNotificationDate == null || key.KeySerialAssignment.ExpiresAt > DateTime.UtcNow.AddDays(7))
                {
                    key.KeySerialAssignment.NextNotificationDate = key.KeySerialAssignment.ExpiresAt.AddDays(-7);
                }
                else if (key.KeySerialAssignment.ExpiresAt > DateTime.UtcNow.AddDays(1))
                {
                    key.KeySerialAssignment.NextNotificationDate = key.KeySerialAssignment.ExpiresAt.AddDays(-1);
                }
                else
                {
                    key.KeySerialAssignment.NextNotificationDate = DateTime.UtcNow.AddDays(1);
                }
                _dbContext.KeySerialAssignments.Update(key.KeySerialAssignment);
            }

            foreach (var equipment in expiringItems.Equipment)
            {
                if (equipment.Assignment.NextNotificationDate == null || equipment.Assignment.ExpiresAt > DateTime.UtcNow.AddDays(7))
                {
                    equipment.Assignment.NextNotificationDate = equipment.Assignment.ExpiresAt.AddDays(-7);
                }
                else if (equipment.Assignment.ExpiresAt > DateTime.UtcNow.AddDays(1))
                {
                    equipment.Assignment.NextNotificationDate = equipment.Assignment.ExpiresAt.AddDays(-1);
                }
                else
                {
                    equipment.Assignment.NextNotificationDate = DateTime.UtcNow.AddDays(1);
                }
                _dbContext.EquipmentAssignments.Update(equipment.Assignment);
            }

            foreach (var workstation in expiringItems.Workstations)
            {
                if (workstation.Assignment.NextNotificationDate == null || workstation.Assignment.ExpiresAt > DateTime.UtcNow.AddDays(7))
                {
                    workstation.Assignment.NextNotificationDate = workstation.Assignment.ExpiresAt.AddDays(-7);
                }
                else if (workstation.Assignment.ExpiresAt > DateTime.UtcNow.AddDays(1))
                {
                    workstation.Assignment.NextNotificationDate = workstation.Assignment.ExpiresAt.AddDays(-1);
                }
                else
                {
                    workstation.Assignment.NextNotificationDate = DateTime.UtcNow.AddDays(1);
                }
                _dbContext.WorkstationAssignments.Update(workstation.Assignment);
            }

            foreach (var access in expiringItems.AccessAssignments)
            {
                if (access.NextNotificationDate == null || access.ExpiresAt > DateTime.UtcNow.AddDays(7))
                {
                    access.NextNotificationDate = access.ExpiresAt.AddDays(-7);
                }
                else if (access.ExpiresAt > DateTime.UtcNow.AddDays(1))
                {
                    access.NextNotificationDate = access.ExpiresAt.AddDays(-1);
                }
                else
                {
                    access.NextNotificationDate = DateTime.UtcNow.AddDays(1);
                }
                _dbContext.AccessAssignments.Update(access);
            }

            await _dbContext.SaveChangesAsync();

            var mimeType = new System.Net.Mime.ContentType("text/html");

            var alternate = AlternateView.CreateAlternateViewFromString(message.Body, mimeType);
            message.AlternateViews.Add(alternate);

            await SendMessage(message);

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

            var message = new System.Net.Mail.MailMessage { From = new MailAddress("peaks-notify.ucdavis.edu", "PEAKS - No Reply") };
            //message.To.Add(user.Email);
            message.To.Add("jsylvestre@ucdavis.edu");

            //Bcc anyone?

            message.Subject = "PEAKS Notification";
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

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            var users = await _dbContext.TeamPermissions.Where(x => x.TeamId == teamId && roles.Any(r => r.Id == x.RoleId)).Select(tp => tp.User).Distinct().ToListAsync();

            return users;
        }
    }
}
