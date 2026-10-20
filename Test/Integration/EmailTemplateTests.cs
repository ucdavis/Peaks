using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Mjml.Net;
using Razor.Templating.Core;
using Xunit;

namespace Test.Integration
{
    public class EmailTemplateTests
    {
        [Fact]
        public async Task SendMailJobRendersNotificationTemplateAndLayoutOnCurrentRuntime()
        {
            // Load the actual WebJob's compiled Razor views, without running its entry point.
            _ = typeof(Keas.Jobs.SendMail.Program).Assembly;
            var team = new Team { Id = 1, Name = "Test team", Slug = "test-team" };
            var notifications = new[]
            {
                new Notification
                {
                    User = new User { FirstName = "Test", LastName = "Recipient" },
                    Team = team, TeamId = team.Id,
                    Details = "Runtime upgrade notification", NeedsAccept = true,
                    DateTimeCreated = new DateTime(2026, 10, 20, 12, 0, 0, DateTimeKind.Utc)
                }
            }.GroupBy(n => n.TeamId).ToList();

            var mjml = await RazorTemplateEngine.RenderAsync("/Views/_Notification.cshtml", notifications);
            var (html, errors) = new MjmlRenderer().Render(mjml);

            Assert.Empty(errors);
            Assert.Contains("Runtime upgrade notification", html);
            Assert.Contains("Test Recipient", html);
            Assert.Contains("https://peaks.ucdavis.edu/test-team", html);
            Assert.Contains("<html", html);
        }
    }
}
