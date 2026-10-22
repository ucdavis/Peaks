using System.Collections.Generic;
using Keas.Mvc;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace Test.Integration
{
    public class SandboxCookieTests
    {
        [Theory]
        [InlineData("Development", "true", "sandbox-a", ".Peaks.TempData.sandbox-a")]
        [InlineData("Development", "true", "sandbox-b", ".Peaks.TempData.sandbox-b")]
        [InlineData("Development", "false", "sandbox-a", ".AspNetCore.Mvc.CookieTempDataProvider")]
        [InlineData("Development", "true", null, ".AspNetCore.Mvc.CookieTempDataProvider")]
        [InlineData("Production", "true", "sandbox-a", ".AspNetCore.Mvc.CookieTempDataProvider")]
        [InlineData("Staging", "true", "sandbox-a", ".AspNetCore.Mvc.CookieTempDataProvider")]
        public void TempDataUsesSandboxCookieOnlyForEnabledDevelopment(string environment, string enabled, string suffix, string expectedName)
        {
            var host = new Mock<IWebHostEnvironment>();
            host.SetupGet(h => h.EnvironmentName).Returns(environment);
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
            {
                ["LocalLogin:Enabled"] = enabled,
                ["LocalLogin:CookieSuffix"] = suffix
            }).Build();
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDataProtection().UseEphemeralDataProtectionProvider();
            new Startup(configuration, host.Object).ConfigureServices(services);
            using var provider = services.BuildServiceProvider();
            var tempData = provider.GetRequiredService<ITempDataProvider>();
            var outgoing = new DefaultHttpContext { RequestServices = provider };
            tempData.SaveTempData(outgoing, new Dictionary<string, object> { ["Message"] = "Saved" });
            var cookie = Assert.Single(outgoing.Response.Headers.SetCookie);
            Assert.StartsWith(expectedName + "=", cookie);
            var incoming = new DefaultHttpContext { RequestServices = provider };
            incoming.Request.Headers.Cookie = cookie.Split(';')[0];
            Assert.Equal("Saved", tempData.LoadTempData(incoming)["Message"]);
        }
    }
}
