using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Controllers;
using Keas.Mvc.Mcp;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Test.Integration;

public sealed class McpDemoTests
{
    [Fact]
    public async Task OAuthDiscoveryPkceToolsRefreshAndRevocationWorkTogether()
    {
        using var app = new DemoApp();
        var challenge = await app.Get("/mcp");
        Assert.Equal(HttpStatusCode.Unauthorized, challenge.StatusCode);
        Assert.Contains("oauth-protected-resource", challenge.Headers.WwwAuthenticate.ToString());
        var metadata = await app.Json(await app.Get("/.well-known/oauth-protected-resource/mcp"));
        Assert.Equal(app.Resource, metadata.GetProperty("resource").GetString());
        await app.Login("reader");
        Assert.Equal(HttpStatusCode.Unauthorized, (await app.Get("/mcp")).StatusCode); // Cookie isn't MCP authorization.
        var authorization = await app.Consent();
        var token = await app.Exchange(authorization);
        Assert.True(token.TryGetProperty("refresh_token", out var refresh));
        var access = token.GetProperty("access_token").GetString();
        var initialized = await app.Rpc(access, "initialize", new { protocolVersion = "2025-11-25", capabilities = new { }, clientInfo = new { name = "test", version = "1" } });
        Assert.True(initialized.GetProperty("result").TryGetProperty("capabilities", out _));
        var tools = await app.Rpc(access, "tools/list", new { });
        Assert.Equal(5, tools.GetProperty("result").GetProperty("tools").GetArrayLength());
        var people = await app.Tool(access, "search_people", new { name = "Javier" });
        Assert.Equal(1, people.GetProperty("totalMatches").GetInt32());
        var personId = people.GetProperty("people")[0].GetProperty("personId").GetInt32();
        var equipment = await app.Tool(access, "get_person_equipment", new { personId, make = "Apple" });
        Assert.Equal(1, equipment.GetProperty("totalMatches").GetInt32());
        Assert.Equal("Apple demo", equipment.GetProperty("equipment")[0].GetProperty("name").GetString());
        var expiring = await app.Tool(access, "list_expiring_equipment", new { period = "this_week" });
        Assert.Equal("2026-11-09", expiring.GetProperty("startDate").GetString());
        Assert.Equal("2026-11-16", expiring.GetProperty("endDateExclusive").GetString());
        Assert.Equal(2, expiring.GetProperty("totalMatches").GetInt32()); // Monday included; following Monday excluded.
        var nextWeek = await app.Tool(access, "list_expiring_equipment", new { period = "next_7_days" });
        Assert.Equal("2026-11-12", nextWeek.GetProperty("startDate").GetString());
        Assert.Equal("2026-11-19", nextWeek.GetProperty("endDateExclusive").GetString());
        var rotated = await app.Refresh(authorization.ClientId, refresh.GetString());
        var newAccess = rotated.GetProperty("access_token").GetString();
        Assert.NotEqual(access, newAccess);
        await app.Tool(newAccess, "get_demo_context", new { });
        var page = await (await app.Get("/oauth/connections")).Content.ReadAsStringAsync();
        var action = Regex.Match(page, "action=\"([^\"]+/revoke)\"").Groups[1].Value;
        Assert.NotEmpty(action);
        Assert.Equal(HttpStatusCode.BadRequest, (await app.PostForm(action, new())).StatusCode);
        Assert.Equal(HttpStatusCode.Redirect, (await app.PostForm(action, new() { ["__RequestVerificationToken"] = DemoApp.Token(page) })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await app.Send(new HttpRequestMessage(HttpMethod.Get, "/mcp"), newAccess)).StatusCode);
        var revoked = await app.PostForm("/oauth/token", new() { ["grant_type"] = "refresh_token", ["refresh_token"] = rotated.GetProperty("refresh_token").GetString(), ["client_id"] = authorization.ClientId, ["resource"] = app.Resource });
        Assert.Equal(HttpStatusCode.BadRequest, revoked.StatusCode);
    }

    [Fact]
    public async Task DeniedConsentDoesNotCreateAGrant()
    {
        using var app = new DemoApp();
        await app.Login("reader");
        await app.Consent(allow: false);
        var page = await (await app.Get("/oauth/connections")).Content.ReadAsStringAsync();
        Assert.Contains("No active connections", page);
        Assert.DoesNotContain("/revoke", page);
    }

    [Fact]
    public async Task UsedRefreshTokenCannotBeReplayed()
    {
        using var app = new DemoApp();
        await app.Login("reader");
        var authorization = await app.Consent();
        var token = await app.Exchange(authorization);
        var refresh = token.GetProperty("refresh_token").GetString();
        await app.Refresh(authorization.ClientId, refresh);
        var replay = await app.PostForm("/oauth/token", new() { ["grant_type"] = "refresh_token", ["client_id"] = authorization.ClientId,
            ["refresh_token"] = refresh, ["resource"] = app.Resource });
        Assert.Equal(HttpStatusCode.BadRequest, replay.StatusCode);
    }

    [Fact]
    public async Task BasicUserAndRemovedPermissionsCannotReadTeamData()
    {
        using var app = new DemoApp();
        await app.Login("basic");
        var token = await app.Exchange(await app.Consent());
        var result = await app.Rpc(token.GetProperty("access_token").GetString(), "tools/call", new { name = "search_equipment", arguments = new { } });
        Assert.True(result.GetProperty("result").GetProperty("isError").GetBoolean());
        Assert.Contains("access_denied", result.GetRawText());
        await app.Login("reader");
        token = await app.Exchange(await app.Consent());
        using (var scope = app.Server.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.TeamPermissions.RemoveRange(db.TeamPermissions);
            await db.SaveChangesAsync();
        }
        result = await app.Rpc(token.GetProperty("access_token").GetString(), "tools/call", new { name = "get_demo_context", arguments = new { } });
        Assert.Contains("access_denied", result.GetRawText());
    }

    [Fact]
    public async Task InvalidPkceWrongResourceCodeReplayAndUntrustedRedirectsAreRejected()
    {
        using var app = new DemoApp();
        var bad = await app.Send(new HttpRequestMessage(HttpMethod.Post, "/oauth/register") { Content = JsonContent.Create(new { redirect_uris = new[] { "https://attacker.example/callback" } }) });
        Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
        await app.Login("reader");
        var authorization = await app.Consent();
        var fields = app.ExchangeFields(authorization);
        fields["code_verifier"] = new string('x', 64);
        Assert.Equal(HttpStatusCode.BadRequest, (await app.PostForm("/oauth/token", fields)).StatusCode);
        authorization = await app.Consent();
        fields = app.ExchangeFields(authorization);
        fields["resource"] = "https://other.example/mcp";
        Assert.Equal(HttpStatusCode.BadRequest, (await app.PostForm("/oauth/token", fields)).StatusCode);
        authorization = await app.Consent();
        await app.Exchange(authorization);
        Assert.Equal(HttpStatusCode.BadRequest, (await app.PostForm("/oauth/token", app.ExchangeFields(authorization))).StatusCode);
        var foreign = new HttpRequestMessage(HttpMethod.Get, "/.well-known/oauth-protected-resource/mcp");
        foreign.Headers.Add("Origin", "https://attacker.example");
        Assert.Equal(HttpStatusCode.Forbidden, (await app.Send(foreign)).StatusCode);
    }

    [Fact]
    public async Task QueryIsolationInputLimitsAndGrantOwnershipAreEnforced()
    {
        using var app = new DemoApp();
        await app.Login("reader");
        var token = await app.Exchange(await app.Consent());
        var access = token.GetProperty("access_token").GetString();
        var results = await app.Tool(access, "search_equipment", new { limit = 1 });
        Assert.True(results.GetProperty("truncated").GetBoolean());
        Assert.Equal(3, results.GetProperty("totalMatches").GetInt32());
        var foreign = await app.Rpc(access, "tools/call", new { name = "get_person_equipment", arguments = new { personId = 99 } });
        Assert.Contains("person_not_found", foreign.GetRawText());
        var invalid = await app.Rpc(access, "tools/call", new { name = "search_equipment", arguments = new { limit = 1000 } });
        Assert.Contains("invalid_input", invalid.GetRawText());
        var page = await (await app.Get("/oauth/connections")).Content.ReadAsStringAsync();
        var action = Regex.Match(page, "action=\"([^\"]+/revoke)\"").Groups[1].Value;
        await app.Login("basic");
        var otherPage = await (await app.Get("/oauth/connections")).Content.ReadAsStringAsync();
        Assert.DoesNotContain(action, otherPage);
        var csrf = await app.GetToken();
        Assert.Equal(HttpStatusCode.NotFound, (await app.PostForm(action, new() { ["__RequestVerificationToken"] = csrf })).StatusCode);
    }

    [Fact]
    public async Task DisabledDemoReturns404()
    {
        using var app = new DemoApp(false);
        foreach (var path in new[] { "/mcp", "/oauth/authorize", "/oauth/connections", "/.well-known/oauth-authorization-server" })
            Assert.Equal(HttpStatusCode.NotFound, (await app.Get(path)).StatusCode);
    }

    [Theory]
    [InlineData("Production", "true", "1", "sql", "PeaksSandbox")]
    [InlineData("Development", "false", "1", "sql", "PeaksSandbox")]
    [InlineData("Development", "true", "0", "sql", "PeaksSandbox")]
    [InlineData("Development", "true", "1", "prod", "PeaksSandbox")]
    [InlineData("Development", "true", "1", "sql", "PeaksProduction")]
    public void DemoCannotBeEnabledOutsideItsSandbox(string environment, string local, string sandbox, string server, string database)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string> {
            ["McpDemo:Enabled"] = "true", ["LocalLogin:Enabled"] = local, ["PEAKS_SANDBOX"] = sandbox,
            ["ConnectionStrings:DefaultConnection"] = $"Server={server};Database={database}" }).Build();
        var host = new Mock<IHostEnvironment>(); host.SetupGet(x => x.EnvironmentName).Returns(environment);
        Assert.Throws<InvalidOperationException>(() => DemoSettings.Read(config, host.Object));
    }

    private sealed class FixedClock : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(2026, 11, 12, 18, 0, 0, TimeSpan.Zero);
    }

    private sealed record Authorization(string ClientId, string Code, string Verifier);

    private sealed class DemoApp : IDisposable
    {
        private readonly SqliteConnection _connection = new("Data Source=:memory:");
        private readonly string _oauthFile = Path.Combine(Path.GetTempPath(), "peaks-mcp-" + Guid.NewGuid().ToString("N") + ".db");
        private readonly HttpClient _client;
        private readonly CookieContainer _cookies = new();
        public TestServer Server { get; }
        public string Resource => "https://localhost:5446/mcp";
        public DemoApp(bool enabled = true)
        {
            _connection.Open();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(_connection).Options;
            using (var db = new ApplicationDbContext(options))
            {
                db.Database.EnsureCreated();
                var team = new Team { Name = "Sandbox Team", Slug = "sandbox" };
                var other = new Team { Name = "Other", Slug = "other" };
                foreach (var id in new[] { "reader", "basic" }) db.Users.Add(new User { Id = id, FirstName = id, LastName = "Demo", Email = id + "@example.test" });
                db.SaveChanges();
                var person = new Person { Id = 1, Team = team, FirstName = "Javier", LastName = "Morales", Email = "javier@example.test" };
                var foreign = new Person { Id = 99, Team = other, FirstName = "Javier", LastName = "Foreign", Email = "foreign@example.test" };
                db.TeamPermissions.Add(new TeamPermission { Team = team, UserId = "reader", Role = new Role { Name = Role.Codes.EquipmentMaster } });
                foreach (var row in new[] { ("Apple demo", person, team, 12, true), ("Monday loan", person, team, 9, true),
                    ("Next week", person, team, 16, true), ("Retired", person, team, 12, false), ("Foreign", foreign, other, 12, true) })
                    db.Equipment.Add(new Equipment { Name = row.Item1, Make = row.Item1 == "Apple demo" ? "Apple" : "Dell", Model = "Test",
                        SerialNumber = row.Item1, Team = row.Item3, Active = row.Item5,
                        Assignment = new EquipmentAssignment { Person = row.Item2, ExpiresAt = new DateTime(2026, 11, row.Item4) } });
                db.SaveChanges();
            }
            Server = new TestServer(new WebHostBuilder().UseEnvironment("Development")
                .ConfigureLogging(logging => logging.ClearProviders())
                .ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string> { ["LocalLogin:Enabled"] = "true" }))
                .ConfigureServices(services =>
                {
                    services.AddControllersWithViews().AddApplicationPart(typeof(AccountController).Assembly);
                    services.AddScoped(_ => new ApplicationDbContext(options));
                    services.AddHttpContextAccessor(); services.AddScoped<ITeamsManager, TeamsManager>();
                    services.Configure<AuthSettings>(o => o.CasBaseUrl = "https://cas.example/");
                    services.AddDistributedMemoryCache(); services.AddSession();
                    services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();
                    if (enabled)
                    {
                        var settings = new DemoSettings(new Uri("https://localhost:5446/"), _oauthFile, null, null);
                        services.AddPeaksMcpDemo(settings);
                        services.AddScoped(provider => new DemoInventory(provider.GetRequiredService<ApplicationDbContext>(), new FixedClock(), settings));
                    }
                })
                .Configure(app =>
                {
                    app.UsePeaksMcpDemoBoundary(); app.UseRouting(); app.UseSession(); app.UseAuthentication(); app.UsePeaksMcpAuthentication(); app.UseAuthorization();
                    app.UseEndpoints(endpoints => { endpoints.MapPeaksMcpDemo(); endpoints.MapControllers(); });
                }));
            _client = Server.CreateClient(); _client.BaseAddress = new Uri("https://localhost:5446");
        }
        public Task<HttpResponseMessage> Get(string path) => Send(new HttpRequestMessage(HttpMethod.Get, path));
        public Task<HttpResponseMessage> PostForm(string path, Dictionary<string, string> fields) => Send(new HttpRequestMessage(HttpMethod.Post, path) { Content = new FormUrlEncodedContent(fields) });
        public static string Token(string html) => WebUtility.HtmlDecode(Regex.Match(html, "name=\"__RequestVerificationToken\"[^>]*value=\"([^\"]+)\"").Groups[1].Value);
        public async Task<string> GetToken() => Token(await (await Get("/login")).Content.ReadAsStringAsync());
        public async Task Login(string user)
        {
            var response = await PostForm("/login/local", new() { ["Login"] = user, ["ReturnUrl"] = "/oauth/connections", ["__RequestVerificationToken"] = await GetToken() });
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        }
        public async Task<Authorization> Consent(bool allow = true)
        {
            var registration = await Json(await Send(new HttpRequestMessage(HttpMethod.Post, "/oauth/register") { Content = JsonContent.Create(new { client_name = "Codex test", redirect_uris = new[] { "http://127.0.0.1:5555/callback" } }) }));
            var clientId = registration.GetProperty("client_id").GetString();
            var verifier = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            var fields = new Dictionary<string, string> { ["client_id"] = clientId, ["response_type"] = "code", ["redirect_uri"] = "http://127.0.0.1:5555/callback",
                ["scope"] = "peaks.inventory.read offline_access", ["resource"] = Resource, ["state"] = "test-state",
                ["code_challenge"] = WebEncoders.Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(verifier))), ["code_challenge_method"] = "S256" };
            var response = await Get(QueryHelpers.AddQueryString("/oauth/authorize", fields));
            Assert.True(response.StatusCode == HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
            fields["__RequestVerificationToken"] = Token(await response.Content.ReadAsStringAsync()); fields["decision"] = allow ? "allow" : "cancel";
            response = await PostForm("/oauth/authorize", fields);
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            var query = QueryHelpers.ParseQuery(response.Headers.Location.Query);
            if (!allow)
            {
                Assert.Equal("access_denied", query["error"].ToString());
                Assert.False(query.ContainsKey("code"));
                return null;
            }
            Assert.False(query.ContainsKey("error"));
            return new Authorization(clientId, query["code"], verifier);
        }
        public Dictionary<string, string> ExchangeFields(Authorization auth) => new() { ["grant_type"] = "authorization_code", ["client_id"] = auth.ClientId,
            ["code"] = auth.Code, ["code_verifier"] = auth.Verifier, ["redirect_uri"] = "http://127.0.0.1:5555/callback", ["resource"] = Resource };
        public async Task<JsonElement> Exchange(Authorization auth) => await Json(await PostForm("/oauth/token", ExchangeFields(auth)));
        public async Task<JsonElement> Refresh(string client, string refresh) => await Json(await PostForm("/oauth/token", new() {
            ["grant_type"] = "refresh_token", ["client_id"] = client, ["refresh_token"] = refresh, ["resource"] = Resource }));
        public async Task<JsonElement> Json(HttpResponseMessage response)
        {
            response.EnsureSuccessStatusCode();
            return JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.Clone();
        }
        public async Task<JsonElement> Rpc(string access, string method, object parameters)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/mcp") { Content = JsonContent.Create(new { jsonrpc = "2.0", id = 1, method, @params = parameters }) };
            request.Headers.Accept.ParseAdd("application/json, text/event-stream");
            request.Headers.Add("MCP-Protocol-Version", "2025-11-25");
            var response = await Send(request, access); response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            if (response.Content.Headers.ContentType.MediaType == "text/event-stream")
                body = body.Split('\n').First(x => x.StartsWith("data: ")).Substring(6);
            return JsonDocument.Parse(body).RootElement.Clone();
        }
        public async Task<JsonElement> Tool(string access, string name, object arguments)
        {
            var result = (await Rpc(access, "tools/call", new { name, arguments })).GetProperty("result");
            Assert.False(result.TryGetProperty("isError", out var error) && error.GetBoolean());
            return JsonDocument.Parse(result.GetProperty("content")[0].GetProperty("text").GetString()).RootElement.Clone();
        }
        public async Task<HttpResponseMessage> Send(HttpRequestMessage request, string bearer = null)
        {
            if (bearer != null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
            var cookies = _cookies.GetCookieHeader(_client.BaseAddress);
            if (cookies.Length > 0) request.Headers.Add("Cookie", cookies);
            var response = await _client.SendAsync(request);
            if (response.Headers.TryGetValues("Set-Cookie", out var values)) foreach (var value in values) _cookies.SetCookies(_client.BaseAddress, value);
            return response;
        }
        public void Dispose() { _client.Dispose(); Server.Dispose(); _connection.Dispose(); SqliteConnection.ClearAllPools(); File.Delete(_oauthFile); }
    }
}
