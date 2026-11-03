using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Reflection;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Core.Resources;
using Keas.Core.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Mjml.Net;
using Moq;
using Serilog;
using Xunit;
using MailProgram = Keas.Jobs.SendMail.Program;

namespace Test.Integration
{
    public class SendMailExpirationTests
    {
        [Fact]
        public void ExpirationJobFiltersKeyStatusesAndPreservesSchedulingAndOtherAssets()
        {
            using var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            using var context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection).Options);
            context.Database.EnsureCreated();
            var now = DateTime.UtcNow;
            var keyTeam = new Team { Name = "Key team", Slug = "key-team" };
            var excludedTeam = new Team { Name = "Excluded team", Slug = "excluded-team" };
            var equipmentTeam = new Team { Name = "Equipment team", Slug = "equipment-team" };
            var mixedPerson = AddPerson(context, keyTeam, "Mixed");
            var excludedPerson = AddPerson(context, excludedTeam, "Excluded");
            var sameTeamExcludedPerson = AddPerson(context, keyTeam, "SameTeamExcluded");
            var equipmentPerson = AddPerson(context, equipmentTeam, "Equipment");

            var active = AddKey(context, keyTeam, mixedPerson, KeySerialStatusModel.Active, now.AddDays(10));
            var special = AddKey(context, keyTeam, mixedPerson, KeySerialStatusModel.Special,
                now.AddDays(10), now.AddDays(-1));
            var overdue = AddKey(context, keyTeam, mixedPerson, KeySerialStatusModel.Active, now.AddDays(-10));
            foreach (var status in new[] { KeySerialStatusModel.Lost, KeySerialStatusModel.Destroyed, KeySerialStatusModel.DogAte })
            {
                AddKey(context, keyTeam, mixedPerson, status, now.AddDays(10));
                AddKey(context, excludedTeam, excludedPerson, status, now.AddDays(10));
            }
            AddKey(context, keyTeam, sameTeamExcludedPerson, KeySerialStatusModel.Lost, now.AddDays(10));
            AddKey(context, excludedTeam, excludedPerson, KeySerialStatusModel.Active,
                now.AddDays(10), now.AddDays(1));
            AddKey(context, excludedTeam, excludedPerson, KeySerialStatusModel.Special, now.AddDays(31));
            AddKey(context, excludedTeam, null, KeySerialStatusModel.Active, now.AddDays(10));
            AddKey(context, equipmentTeam, equipmentPerson, KeySerialStatusModel.Lost, now.AddDays(10));
            var equipment = new Equipment
            {
                Name = "Loan laptop",
                Team = equipmentTeam,
                Assignment = new EquipmentAssignment
                {
                    Person = equipmentPerson,
                    ExpiresAt = now.AddDays(10)
                }
            };
            context.Equipment.Add(equipment);
            context.SaveChanges();
            context.ChangeTracker.Clear();

            var personCalls = new List<(int Id, ExpiringItemsEmailModel Model)>();
            var teamCalls = new List<(int Id, ExpiringItemsEmailModel Model)>();
            var emails = new Mock<IEmailService>(MockBehavior.Strict);
            emails.Setup(service => service.SendExpiringMessage(It.IsAny<int>(), It.IsAny<ExpiringItemsEmailModel>()))
                .Callback<int, ExpiringItemsEmailModel>((id, model) => personCalls.Add((id, model)))
                .Returns(Task.CompletedTask);
            emails.Setup(service => service.SendTeamExpiringMessage(It.IsAny<int>(), It.IsAny<ExpiringItemsEmailModel>()))
                .Callback<int, ExpiringItemsEmailModel>((id, model) => teamCalls.Add((id, model)))
                .Returns(Task.CompletedTask);
            emails.Setup(service => service.SendPersonNotification()).Returns(Task.CompletedTask);
            using var provider = new ServiceCollection()
                .AddSingleton(context)
                .AddSingleton(emails.Object)
                .BuildServiceProvider();

            InvokeSendEmails(provider);

            Assert.Equal(new[] { mixedPerson.Id, equipmentPerson.Id }.OrderBy(id => id),
                personCalls.Select(call => call.Id).OrderBy(id => id));
            Assert.Equal(new[] { keyTeam.Id, equipmentTeam.Id }.OrderBy(id => id),
                teamCalls.Select(call => call.Id).OrderBy(id => id));
            var expectedKeyIds = new[] { active.Id, special.Id, overdue.Id }.OrderBy(id => id).ToArray();
            foreach (var model in personCalls.Select(call => call.Model).Concat(teamCalls.Select(call => call.Model)))
            {
                Assert.Equal(expectedKeyIds, model.KeySerials.Select(serial => serial.Id).OrderBy(id => id));
                Assert.Equal(equipment.Id, Assert.Single(model.Equipment).Id);
                Assert.Equal(new[] { mixedPerson.Id, equipmentPerson.Id }.OrderBy(id => id),
                    model.People.Select(person => person.Id).OrderBy(id => id));
            }
            emails.Verify(service => service.SendExpiringMessage(It.IsAny<int>(), It.IsAny<ExpiringItemsEmailModel>()), Times.Exactly(2));
            emails.Verify(service => service.SendTeamExpiringMessage(It.IsAny<int>(), It.IsAny<ExpiringItemsEmailModel>()), Times.Exactly(2));
            emails.Verify(service => service.SendPersonNotification(), Times.Once);
            emails.VerifyNoOtherCalls();
        }

        [Fact]
        public void ExpirationJobSkipsTeamsWithoutRecipientsAndContinuesNotifications()
        {
            using var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            using var context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection).Options);
            context.Database.EnsureCreated();
            var expiresAt = DateTime.UtcNow.AddDays(10);
            var skippedTeam = new Team { Name = "Skipped team", Slug = "skipped-team" };
            var eligibleTeam = new Team { Name = "Eligible team", Slug = "eligible-team" };
            var equipmentPerson = AddPerson(context, skippedTeam, "Equipment");
            var workstationPerson = AddPerson(context, eligibleTeam, "Workstation");
            var lostKey = AddKey(context, skippedTeam, equipmentPerson, KeySerialStatusModel.Lost, expiresAt);
            var keyMaster = new User
            {
                Id = "key-master", FirstName = "Key", LastName = "Master", Email = "keys@example.test"
            };
            var spaceMaster = new User
            {
                Id = "space-master", FirstName = "Space", LastName = "Master", Email = "spaces@example.test"
            };
            context.TeamPermissions.AddRange(
                new TeamPermission { Team = skippedTeam, User = keyMaster, Role = new Role { Name = Role.Codes.KeyMaster } },
                new TeamPermission { Team = eligibleTeam, User = spaceMaster, Role = new Role { Name = Role.Codes.SpaceMaster } });
            var equipment = new Equipment
            {
                Name = "Loan laptop",
                Team = skippedTeam,
                Assignment = new EquipmentAssignment { Person = equipmentPerson, ExpiresAt = expiresAt }
            };
            // Equipment teams precede workstation teams in the job's recipient list.
            var workstation = new Workstation
            {
                Name = "Loan desk",
                Team = eligibleTeam,
                Space = new Space { BldgName = "Test building", RoomNumber = "101" },
                Assignment = new WorkstationAssignment { Person = workstationPerson, ExpiresAt = expiresAt }
            };
            context.Equipment.Add(equipment);
            context.Workstations.Add(workstation);
            context.SaveChanges();
            var notification = new PersonNotification
            {
                Team = eligibleTeam,
                PersonId = workstationPerson.Id,
                PersonName = workstationPerson.Name,
                PersonEmail = workstationPerson.Email,
                NotificationEmail = "changes@example.test",
                ActorName = "Test admin",
                Action = PersonNotification.Actions.Added
            };
            context.PersonNotifications.Add(notification);
            context.SaveChanges();
            context.ChangeTracker.Clear();

            var pickupDirectory = Path.Combine(AppContext.BaseDirectory, "mail-expiration-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(pickupDirectory);
            try
            {
                var emailService = new EmailService(context, Options.Create(new SparkpostSettings
                {
                    Host = "localhost", Port = 25, DisableSend = "No"
                }), new MjmlRenderer());
                var clientField = typeof(EmailService).GetField("_client", BindingFlags.NonPublic | BindingFlags.Instance);
                Assert.NotNull(clientField);
                using var client = Assert.IsType<SmtpClient>(clientField.GetValue(emailService));
                client.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                client.PickupDirectoryLocation = pickupDirectory;
                client.EnableSsl = false;
                using var provider = new ServiceCollection()
                    .AddSingleton(context)
                    .AddSingleton<IEmailService>(emailService)
                    .BuildServiceProvider();

                InvokeSendEmails(provider);

                var headers = Directory.GetFiles(pickupDirectory, "*.eml")
                    .Select(path => File.ReadAllText(path).Split(new[] { "\r\n\r\n", "\n\n" }, 2, StringSplitOptions.None)[0])
                    .ToArray();
                Assert.Equal(4, headers.Length);
                Assert.Equal(2, headers.Count(header => header.Contains("Subject: PEAKS Expiring Items")));
                var teamEmail = Assert.Single(headers.Where(header => header.Contains("Subject: PEAKS Admin Expiring Items Notification")));
                Assert.Contains(spaceMaster.Email, teamEmail);
                Assert.DoesNotContain(headers, header => header.Contains(keyMaster.Email));
                var personNotificationEmail = Assert.Single(headers.Where(header => header.Contains("Subject: PEAKS People Notification")));
                Assert.Contains(notification.NotificationEmail, personNotificationEmail);

                context.ChangeTracker.Clear();
                var savedNotification = context.PersonNotifications.Single(item => item.Id == notification.Id);
                Assert.False(savedNotification.Pending);
                Assert.NotNull(savedNotification.NotificationDate);
                Assert.Null(context.KeySerialAssignments.Single(assignment => assignment.KeySerialId == lostKey.Id).NextNotificationDate);
                Assert.Equal(expiresAt.AddDays(-7), context.EquipmentAssignments.Single(assignment => assignment.Id == equipment.Assignment.Id).NextNotificationDate);
                Assert.Equal(expiresAt.AddDays(-7), context.WorkstationAssignments.Single(assignment => assignment.Id == workstation.Assignment.Id).NextNotificationDate);
            }
            finally
            {
                foreach (var file in Directory.GetFiles(pickupDirectory))
                {
                    File.Delete(file);
                }
                Directory.Delete(pickupDirectory);
            }
        }

        private static Person AddPerson(ApplicationDbContext context, Team team, string name)
        {
            var person = new Person
            {
                Team = team,
                FirstName = name,
                LastName = "Person",
                Email = $"{name.ToLowerInvariant()}@example.test"
            };
            context.People.Add(person);
            return person;
        }

        private static KeySerial AddKey(ApplicationDbContext context, Team team, Person person, string status,
            DateTime expiresAt, DateTime? nextNotificationDate = null)
        {
            var serial = new KeySerial
            {
                Name = "Test serial",
                Number = Guid.NewGuid().ToString("N"),
                Team = team,
                Key = new Key { Name = "Test key", Code = Guid.NewGuid().ToString("N"), Team = team },
                Status = status
            };
            if (person != null)
            {
                serial.KeySerialAssignment = new KeySerialAssignment
                {
                    Person = person,
                    ExpiresAt = expiresAt,
                    NextNotificationDate = nextNotificationDate
                };
            }
            context.KeySerials.Add(serial);
            return serial;
        }

        private static void InvokeSendEmails(ServiceProvider provider)
        {
            const BindingFlags flags = BindingFlags.NonPublic | BindingFlags.Static;
            var sendEmails = typeof(MailProgram).GetMethod("SendEmails", flags);
            var loggerField = typeof(MailProgram).GetField("_log", flags);
            Assert.NotNull(sendEmails);
            Assert.NotNull(loggerField);
            var originalLogger = loggerField.GetValue(null);
            using var silentLogger = new LoggerConfiguration().CreateLogger();
            try
            {
                loggerField.SetValue(null, silentLogger);
                sendEmails.Invoke(null, new object[] { provider });
            }
            finally
            {
                loggerField.SetValue(null, originalLogger);
            }
        }
    }
}
