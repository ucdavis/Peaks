using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AspNetCore.Security.CAS;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Controllers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Test.Integration
{
    public class LocalLoginTests
    {
        [Theory]
        [InlineData("Development", null)]
        [InlineData("Development", "false")]
        [InlineData("Production", "true")]
        [InlineData("Staging", "true")]
        public async Task DisabledLoginUsesCasAndCannotIssueLocalCookie(string environment, string enabled)
        {
            using var app = new LoginApp(environment, enabled);
            var response = await app.Get("/login?returnUrl=https://untrusted.example");
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.StartsWith("https://cas.example/", response.Headers.Location.ToString());
            // Obtain a real antiforgery token independently when the login view is disabled.
            var token = await app.GetToken("/token");
            response = await app.PostLogin("alice", token);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal("anonymous|", await app.Probe());
        }

        [Fact]
        public async Task LoginRequiresPostAndAntiforgery()
        {
            using var app = new LoginApp();
            Assert.Equal(HttpStatusCode.MethodNotAllowed, (await app.Get("/login/local")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await app.PostLogin("alice", null)).StatusCode);
            Assert.Equal("anonymous|", await app.Probe());
        }

        [Theory]
        [InlineData("unknown")]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("shared@example.com")]
        public async Task InvalidIdentityDoesNotSignInOrCreateUsers(string login)
        {
            using var app = new LoginApp();
            var response = await app.PostLogin(login, await app.GetToken());
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains("field-validation-error", await response.Content.ReadAsStringAsync());
            Assert.Equal("anonymous|", await app.Probe());
            using var context = new ApplicationDbContext(app.Options);
            Assert.Equal(4, await context.Users.CountAsync());
        }

        [Theory]
        [InlineData("alice", "/destination?test=1", "/destination?test=1")]
        [InlineData(" alice@example.com ", "https://untrusted.example", "/")]
        [InlineData("alice", "//untrusted.example", "/")]
        public async Task ExistingIdentityUsesRealCookieAndSafeReturn(string login, string returnUrl, string expected)
        {
            using var app = new LoginApp();
            var response = await app.PostLogin(login, await app.GetToken(), returnUrl);
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal(expected, response.Headers.Location.ToString());
            Assert.Equal("alice|Admin", await app.Probe());
        }

        [Fact]
        public async Task SwitchingUsersAndResigningInRefreshesDatabasePermissions()
        {
            using var app = new LoginApp();
            await app.PostLogin("alice", await app.GetToken());
            Assert.Equal("alice|Admin", await app.Probe());
            await app.PostLogin("bob", await app.GetToken());
            Assert.Equal("bob|", await app.Probe());
            await app.PostLogin("alice", await app.GetToken());
            Assert.Equal("alice|Admin", await app.Probe());
            using (var context = new ApplicationDbContext(app.Options))
            {
                context.SystemPermissions.RemoveRange(context.SystemPermissions);
                await context.SaveChangesAsync();
            }
            // Same-user login must invalidate previously cached permissions too.
            await app.PostLogin("alice", await app.GetToken());
            Assert.Equal("alice|", await app.Probe());
            await app.PostLogin("bob", await app.GetToken());
            Assert.Equal("bob|", await app.Probe());
            var logout = await app.Get("/Account/Logout2");
            Assert.Equal("/login", logout.Headers.Location.ToString());
            Assert.Equal("anonymous|", await app.Probe());
        }

        [Fact]
        public async Task CasRemainsAvailableAndCasLogoutIsPreserved()
        {
            using var app = new LoginApp();
            var response = await app.Get("/login?useCas=true&returnUrl=/destination");
            Assert.StartsWith("https://cas.example/", response.Headers.Location.ToString());
            await app.Get("/cas-session");
            Assert.Equal("https://cas.example/logout", (await app.Get("/Account/Logout2")).Headers.Location.ToString());
        }

        // Exercise the production controller, Razor view, cookie handler, antiforgery,
        // SQLite queries and TeamsManager without starting the unrelated React dev server.
        private sealed class LoginApp : IDisposable
        {
            private readonly SqliteConnection _connection;
            private readonly TestServer _server;
            private readonly HttpClient _client;
            private readonly CookieContainer _cookies = new CookieContainer();
            public DbContextOptions<ApplicationDbContext> Options { get; }

            public LoginApp(string environment = "Development", string enabled = "true")
            {
                _connection = new SqliteConnection("Data Source=:memory:");
                _connection.Open();
                Options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(_connection).Options;
                using (var context = new ApplicationDbContext(Options))
                {
                    context.Database.EnsureCreated();
                    foreach (var id in new[] { "alice", "bob", "duplicate1", "duplicate2" })
                        context.Users.Add(new User { Id = id, FirstName = id, LastName = "Test", Email = id.StartsWith("duplicate") ? "shared@example.com" : id + "@example.com" });
                    context.SaveChanges();
                    context.SystemPermissions.Add(new SystemPermission { UserId = "alice", Role = new Role { Name = "Admin" } });
                    context.SaveChanges();
                }
                _server = new TestServer(new WebHostBuilder()
                    .UseEnvironment(environment)
                    .ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string> { ["LocalLogin:Enabled"] = enabled }))
                    .ConfigureServices(services =>
                    {
                        services.AddControllersWithViews().AddApplicationPart(typeof(AccountController).Assembly);
                        services.AddScoped<ApplicationDbContext>(_ => new ApplicationDbContext(Options));
                        services.AddHttpContextAccessor();
                        services.AddScoped<ITeamsManager, TeamsManager>();
                        services.Configure<AuthSettings>(o => o.CasBaseUrl = "https://cas.example/");
                        services.AddDistributedMemoryCache();
                        services.AddSession();
                        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                            .AddCookie().AddCAS(o => { o.CasServerUrlBase = "https://cas.example/"; o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme; });
                    })
                    .Configure(app =>
                    {
                        app.UseRouting();
                        app.UseSession();
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapControllers();
                            endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}");
                            endpoints.MapGet("/probe", async context =>
                            {
                                var name = context.User.Identity.IsAuthenticated ? context.User.Identity.Name : "anonymous";
                                var roles = await context.RequestServices.GetRequiredService<ITeamsManager>().GetSystemRoleNames();
                                await context.Response.WriteAsync(name + "|" + string.Join(",", roles));
                            });
                            endpoints.MapGet("/token", async context =>
                            {
                                var tokens = context.RequestServices.GetRequiredService<Microsoft.AspNetCore.Antiforgery.IAntiforgery>().GetAndStoreTokens(context);
                                await context.Response.WriteAsync("<input name=\"__RequestVerificationToken\" value=\"" + tokens.RequestToken + "\" />");
                            });
                            endpoints.MapGet("/cas-session", async context =>
                            {
                                await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "alice") }, "CAS")));
                            });
                        });
                    }));
                _client = _server.CreateClient();
                _client.BaseAddress = new Uri("https://localhost");
            }

            public Task<HttpResponseMessage> Get(string path) => Send(new HttpRequestMessage(HttpMethod.Get, path));
            public async Task<string> Probe() => await (await Get("/probe")).Content.ReadAsStringAsync();
            public async Task<string> GetToken(string path = "/login")
            {
                var response = await Get(path);
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var html = await response.Content.ReadAsStringAsync();
                var match = Regex.Match(html, "name=\"__RequestVerificationToken\"[^>]*value=\"([^\"]+)\"");
                Assert.True(match.Success, html);
                return WebUtility.HtmlDecode(match.Groups[1].Value);
            }
            public Task<HttpResponseMessage> PostLogin(string login, string token, string returnUrl = "/")
            {
                var fields = new Dictionary<string, string> { ["Login"] = login, ["ReturnUrl"] = returnUrl };
                if (token != null) fields["__RequestVerificationToken"] = token;
                return Send(new HttpRequestMessage(HttpMethod.Post, "/login/local") { Content = new FormUrlEncodedContent(fields) });
            }
            private async Task<HttpResponseMessage> Send(HttpRequestMessage request)
            {
                var cookieHeader = _cookies.GetCookieHeader(_client.BaseAddress);
                if (cookieHeader.Length > 0) request.Headers.Add("Cookie", cookieHeader);
                var response = await _client.SendAsync(request);
                if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
                    foreach (var cookie in cookies) _cookies.SetCookies(_client.BaseAddress, cookie);
                return response;
            }
            public void Dispose() { _client.Dispose(); _server.Dispose(); _connection.Dispose(); }
        }
    }
}
