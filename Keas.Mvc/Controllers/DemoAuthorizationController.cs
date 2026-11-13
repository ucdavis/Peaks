using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Mcp;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Keas.Mvc.Controllers;

[AllowAnonymous, ApiExplorerSettings(IgnoreApi = true)]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class DemoAuthorizationController : Controller
{
    private const string Scheme = OpenIddictServerAspNetCoreDefaults.AuthenticationScheme;
    private IServiceProvider Services => HttpContext.RequestServices;

    [HttpPost("oauth/register"), IgnoreAntiforgeryToken, RequestSizeLimit(8192)]
    public async Task<IActionResult> Register(CancellationToken ct)
    {
        if (Services.GetService<DemoSettings>() == null) return NotFound();
        if (!Request.HasJsonContentType()) return StatusCode(415);
        try
        {
            using var document = await JsonDocument.ParseAsync(Request.Body, new JsonDocumentOptions { MaxDepth = 8 }, ct);
            var root = document.RootElement;
            var redirects = root.GetProperty("redirect_uris").EnumerateArray().Select(x => x.GetString()).ToArray();
            if (redirects.Length < 1 || redirects.Length > 4 || redirects.Any(x => !ValidRedirect(x))) return BadRegistration();
            if (root.TryGetProperty("token_endpoint_auth_method", out var method) && method.GetString() != "none") return BadRegistration();
            if (root.TryGetProperty("grant_types", out var grants) && grants.EnumerateArray().Any(x => x.GetString() != GrantTypes.AuthorizationCode && x.GetString() != GrantTypes.RefreshToken)) return BadRegistration();
            if (root.TryGetProperty("response_types", out var responses) && responses.EnumerateArray().Any(x => x.GetString() != ResponseTypes.Code)) return BadRegistration();
            var name = root.TryGetProperty("client_name", out var clientName) ? clientName.GetString() : "Local Codex";
            if (string.IsNullOrWhiteSpace(name) || name.Length > 100 || name.Any(char.IsControl)) return BadRegistration();
            var manager = Services.GetRequiredService<IOpenIddictApplicationManager>();
            var gate = Services.GetRequiredService<DemoClientRegistrationLock>().Gate;
            await gate.WaitAsync(ct);
            try
            {
                if (await manager.CountAsync(ct) >= 100) return StatusCode(429, new { error = "registration_limit" });
                var descriptor = new OpenIddictApplicationDescriptor
                {
                    ClientId = Guid.NewGuid().ToString("N"), ClientType = ClientTypes.Public,
                    DisplayName = name, ConsentType = ConsentTypes.Explicit
                };
                foreach (var redirect in redirects) descriptor.RedirectUris.Add(new Uri(redirect));
                descriptor.Permissions.UnionWith(new[] { Permissions.Endpoints.Authorization, Permissions.Endpoints.Token,
                    Permissions.Endpoints.Revocation, Permissions.GrantTypes.AuthorizationCode, Permissions.GrantTypes.RefreshToken,
                    Permissions.ResponseTypes.Code, Permissions.Prefixes.Scope + DemoSettings.Scope,
                    Permissions.Prefixes.Resource + Services.GetRequiredService<DemoSettings>().Resource });
                descriptor.Requirements.Add(Requirements.Features.ProofKeyForCodeExchange);
                await manager.CreateAsync(descriptor, ct);
                return StatusCode(201, new { client_id = descriptor.ClientId, client_name = name,
                    redirect_uris = redirects, token_endpoint_auth_method = "none",
                    grant_types = new[] { "authorization_code", "refresh_token" }, response_types = new[] { "code" },
                    scope = DemoSettings.Scope + " offline_access" });
            }
            finally { gate.Release(); }
        }
        catch (Exception exception) when (exception is JsonException || exception is InvalidOperationException || exception is KeyNotFoundException || exception is ArgumentException)
        { return BadRegistration(); }
    }

    public static bool ValidRedirect(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        (uri.Scheme == "http" || uri.Scheme == "https") &&
        (uri.Host == "localhost" || uri.Host == "127.0.0.1" || uri.Host == "[::1]") &&
        uri.UserInfo.Length == 0 && uri.Fragment.Length == 0 && uri.Query.Length == 0;

    [HttpGet("oauth/authorize")]
    public Task<IActionResult> Authorize(CancellationToken ct) => AuthorizeCore(false, ct);

    [HttpPost("oauth/authorize"), ValidateAntiForgeryToken, RequestSizeLimit(16384)]
    public Task<IActionResult> Consent(CancellationToken ct) => AuthorizeCore(true, ct);

    private async Task<IActionResult> AuthorizeCore(bool submitted, CancellationToken ct)
    {
        var settings = Services.GetService<DemoSettings>();
        if (settings == null) return NotFound();
        var request = HttpContext.GetOpenIddictServerRequest();
        var userId = await BrowserUser(ct);
        if (userId == null)
        {
            if (submitted || request.HasPromptValue(PromptValues.None)) return Reject(Errors.LoginRequired);
            return LocalRedirect("/login?returnUrl=" + Uri.EscapeDataString(Request.Path + Request.QueryString));
        }
        if (request.HasPromptValue(PromptValues.None)) return Reject(Errors.ConsentRequired);
        var applications = Services.GetRequiredService<IOpenIddictApplicationManager>();
        var application = await applications.FindByClientIdAsync(request.ClientId, ct);
        if (application == null) return Reject(Errors.InvalidClient);
        if (!submitted)
        {
            Response.Headers["Referrer-Policy"] = "strict-origin";
            return View("Consent", new DemoConsent(await applications.GetDisplayNameAsync(application, ct), userId,
                Request.Query.Where(p => p.Key != "decision" && p.Key != "__RequestVerificationToken")
                    .ToDictionary(p => p.Key, p => p.Value.ToString())));
        }
        if (Request.Form["decision"] != "allow") return Reject(Errors.AccessDenied);
        var principal = new ClaimsPrincipal(new ClaimsIdentity("PeaksDemoOAuth"));
        principal.SetClaim(Claims.Subject, userId);
        var deadline = Services.GetRequiredService<TimeProvider>().GetUtcNow().AddHours(8);
        principal.SetClaim(DemoSettings.DeadlineClaim, deadline.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
        principal.SetScopes(request.GetScopes());
        principal.SetResources(settings.Resource);
        var authorizations = Services.GetRequiredService<IOpenIddictAuthorizationManager>();
        var authorization = await authorizations.CreateAsync(principal, userId, await applications.GetIdAsync(application, ct),
            AuthorizationTypes.Permanent, principal.GetScopes(), ct);
        principal.SetAuthorizationId(await authorizations.GetIdAsync(authorization, ct));
        return SignIn(principal, Scheme);
    }

    [HttpPost("oauth/token"), IgnoreAntiforgeryToken, RequestSizeLimit(16384)]
    public async Task<IActionResult> Token(CancellationToken ct)
    {
        if (Services.GetService<DemoSettings>() == null) return NotFound();
        var principal = (await HttpContext.AuthenticateAsync(Scheme)).Principal;
        if (principal == null || !long.TryParse(principal.GetClaim(DemoSettings.DeadlineClaim), out var deadline) ||
            !await Services.GetRequiredService<ApplicationDbContext>().Users.AnyAsync(x => x.Id == principal.GetClaim(Claims.Subject), ct))
            return Reject(Errors.InvalidGrant);
        var remaining = DateTimeOffset.FromUnixTimeSeconds(deadline) - Services.GetRequiredService<TimeProvider>().GetUtcNow();
        if (remaining <= TimeSpan.Zero) return Reject(Errors.InvalidGrant);
        principal.SetAccessTokenLifetime(remaining < TimeSpan.FromMinutes(15) ? remaining : TimeSpan.FromMinutes(15));
        principal.SetRefreshTokenLifetime(remaining);
        return SignIn(principal, Scheme);
    }

    [HttpGet("oauth/connections")]
    public async Task<IActionResult> Connections(CancellationToken ct)
    {
        if (Services.GetService<DemoSettings>() == null) return NotFound();
        var userId = await BrowserUser(ct);
        if (userId == null) return LocalRedirect("/login?returnUrl=%2Foauth%2Fconnections");
        Response.Headers["Referrer-Policy"] = "strict-origin";
        var authorizations = Services.GetRequiredService<IOpenIddictAuthorizationManager>();
        var applications = Services.GetRequiredService<IOpenIddictApplicationManager>();
        var connections = new List<DemoConnection>();
        await foreach (var authorization in authorizations.FindAsync(subject: userId, client: null, status: Statuses.Valid, type: AuthorizationTypes.Permanent, scopes: null, cancellationToken: ct))
        {
            var clientId = await authorizations.GetApplicationIdAsync(authorization, ct);
            var client = await applications.FindByIdAsync(clientId, ct);
            connections.Add(new DemoConnection(await authorizations.GetIdAsync(authorization, ct),
                client == null ? "MCP client" : await applications.GetDisplayNameAsync(client, ct),
                (await authorizations.GetCreationDateAsync(authorization, ct))?.AddHours(8)));
        }
        return View("Connections", new DemoConnections(userId, connections));
    }

    [HttpPost("oauth/connections/{id}/revoke"), ValidateAntiForgeryToken]
    public async Task<IActionResult> Revoke(string id, CancellationToken ct)
    {
        if (Services.GetService<DemoSettings>() == null) return NotFound();
        var userId = await BrowserUser(ct);
        if (userId == null) return Unauthorized();
        var authorizations = Services.GetRequiredService<IOpenIddictAuthorizationManager>();
        var authorization = await authorizations.FindByIdAsync(id, ct);
        if (authorization == null || await authorizations.GetSubjectAsync(authorization, ct) != userId) return NotFound();
        if (!await authorizations.TryRevokeAsync(authorization, ct)) return Conflict();
        await Services.GetRequiredService<IOpenIddictTokenManager>().RevokeByAuthorizationIdAsync(id, ct);
        return LocalRedirect("/oauth/connections");
    }

    private async Task<string> BrowserUser(CancellationToken ct)
    {
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!result.Succeeded || !result.Principal.HasClaim("peaks:local-login", "true")) return null;
        var id = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return await Services.GetRequiredService<ApplicationDbContext>().Users.AnyAsync(x => x.Id == id, ct) ? id : null;
    }
    private IActionResult BadRegistration() => BadRequest(new { error = "invalid_client_metadata" });
    private IActionResult Reject(string error) => Forbid(new AuthenticationProperties(new Dictionary<string, string>
        { [OpenIddictServerAspNetCoreConstants.Properties.Error] = error }), Scheme);
}

public sealed record DemoConsent(string Client, string User, Dictionary<string, string> Parameters);
public sealed record DemoConnection(string Id, string Client, DateTimeOffset? Expires);
public sealed record DemoConnections(string User, List<DemoConnection> Connections);
