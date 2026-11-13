using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using Keas.Mvc.Mcp;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenIddict.Abstractions;
using OpenIddict.Server;
using OpenIddict.Validation.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Microsoft.Extensions.DependencyInjection;

public static class DemoRegistration
{
    public static void AddPeaksMcpDemo(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var settings = DemoSettings.Read(configuration, environment);
        if (settings != null) services.AddPeaksMcpDemo(settings);
    }

    public static void AddPeaksMcpDemo(this IServiceCollection services, DemoSettings settings)
    {
        services.AddSingleton(settings);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<DemoClientRegistrationLock>();
        services.AddScoped<DemoInventory>();
        services.AddDbContext<DemoOAuthDbContext>(options => options.UseSqlite("Data Source=" + settings.DatabasePath).UseOpenIddict());
        services.AddHostedService<DemoOAuthInitialize>();
        services.AddOpenIddict()
            .AddCore(options => { options.UseEntityFrameworkCore().UseDbContext<DemoOAuthDbContext>(); options.DisableEntityCaching(); })
            .AddServer(options =>
            {
                options.SetIssuer(settings.Issuer);
                options.SetAuthorizationEndpointUris("/oauth/authorize").SetTokenEndpointUris("/oauth/token").SetRevocationEndpointUris("/oauth/revoke");
                options.AllowAuthorizationCodeFlow().AllowRefreshTokenFlow().RequireProofKeyForCodeExchange();
                options.RegisterScopes(DemoSettings.Scope);
                options.RegisterResources(settings.Resource);
                options.UseReferenceAccessTokens().UseReferenceRefreshTokens().UseDataProtection();
                options.SetAccessTokenLifetime(TimeSpan.FromMinutes(15)).SetAuthorizationCodeLifetime(TimeSpan.FromMinutes(2))
                    .SetRefreshTokenLifetime(TimeSpan.FromHours(8)).SetRefreshTokenReuseLeeway(TimeSpan.Zero);
                if (settings.CertificatePath != null)
                {
                    var certificate = X509CertificateLoader.LoadPkcs12FromFile(settings.CertificatePath, settings.CertificatePassword);
                    options.AddSigningCertificate(certificate).AddEncryptionCertificate(certificate);
                }
                else options.AddEphemeralSigningKey().AddEphemeralEncryptionKey(); // In-process tests only.
                options.Configure(o =>
                {
                    o.CodeChallengeMethods.Clear(); o.CodeChallengeMethods.Add(CodeChallengeMethods.Sha256);
                    o.ClientAuthenticationMethods.Clear(); o.ClientAuthenticationMethods.Add(ClientAuthenticationMethods.None);
                });
                options.UseAspNetCore().EnableAuthorizationEndpointPassthrough().EnableTokenEndpointPassthrough();
                options.AddEventHandler<OpenIddictServerEvents.ValidateAuthorizationRequestContext>(builder => builder.UseInlineHandler(context =>
                {
                    if (!ValidResource(context.Request, settings) || !context.Request.HasScope(DemoSettings.Scope))
                        context.Reject(Errors.InvalidTarget, "Request the PEAKS inventory resource and scope.");
                    return default;
                }));
                options.AddEventHandler<OpenIddictServerEvents.ValidateTokenRequestContext>(builder => builder.UseInlineHandler(context =>
                {
                    if (!ValidResource(context.Request, settings)) context.Reject(Errors.InvalidTarget, "Invalid resource.");
                    return default;
                }));
                options.AddEventHandler<OpenIddictServerEvents.HandleConfigurationRequestContext>(builder => builder.UseInlineHandler(context =>
                {
                    context.Metadata["registration_endpoint"] = new Uri(settings.Issuer, "oauth/register").AbsoluteUri;
                    return default;
                }));
            })
            .AddValidation(options =>
            {
                options.UseLocalServer(); options.UseDataProtection();
                options.UseAspNetCore().DisableAccessTokenExtractionFromQueryString().DisableAccessTokenExtractionFromBodyForm();
                options.AddAudiences(settings.Resource);
                options.EnableTokenEntryValidation(); options.EnableAuthorizationEntryValidation();
            });
        services.AddAuthorization(options => options.AddPolicy(DemoSettings.Policy, policy => policy
            .AddAuthenticationSchemes(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)
            .RequireAuthenticatedUser().RequireAssertion(context => context.User.HasScope(DemoSettings.Scope))));
        services.AddMcpServer().WithHttpTransport(options => options.Stateless = true).WithTools<DemoTools>();
    }

    private static bool ValidResource(OpenIddictRequest request, DemoSettings settings) =>
        request.GetResources().SequenceEqual(new[] { settings.Resource });

    public static void UsePeaksMcpDemoBoundary(this IApplicationBuilder app)
    {
        var settings = app.ApplicationServices.GetService<DemoSettings>();
        app.Use(async (context, next) =>
        {
            var path = context.Request.Path;
            if (!path.StartsWithSegments("/mcp") && !path.StartsWithSegments("/oauth") && !path.StartsWithSegments("/.well-known"))
            { await next(); return; }
            if (settings == null) { context.Response.StatusCode = 404; return; }
            context.Response.Headers.CacheControl = "no-store";
            context.Response.Headers["Referrer-Policy"] = "no-referrer";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-Frame-Options"] = "DENY";
            var origin = settings.Issuer.GetLeftPart(UriPartial.Authority);
            if (!context.Request.IsHttps || context.Request.Host.Value != settings.Issuer.Authority ||
                (context.Request.Headers.ContainsKey("Origin") && context.Request.Headers.Origin.ToString() != origin))
            { context.Response.StatusCode = 403; return; }
            await next();
        });
    }

    public static void UsePeaksMcpAuthentication(this IApplicationBuilder app)
    {
        var settings = app.ApplicationServices.GetService<DemoSettings>();
        if (settings == null) return;
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/mcp"))
            {
                var result = await context.AuthenticateAsync(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
                if (!result.Succeeded)
                {
                    context.Response.StatusCode = 401;
                    context.Response.Headers.WWWAuthenticate = $"Bearer resource_metadata=\"{settings.Issuer.AbsoluteUri}.well-known/oauth-protected-resource/mcp\", scope=\"{DemoSettings.Scope}\"";
                    return;
                }
                context.User = result.Principal;
            }
            await next();
        });
    }

    public static void MapPeaksMcpDemo(this IEndpointRouteBuilder endpoints)
    {
        var settings = endpoints.ServiceProvider.GetService<DemoSettings>();
        if (settings == null) return;
        endpoints.MapGet("/.well-known/oauth-protected-resource/mcp", () => Results.Json(new
        {
            resource = settings.Resource, authorization_servers = new[] { settings.Issuer.AbsoluteUri },
            scopes_supported = new[] { DemoSettings.Scope }, bearer_methods_supported = new[] { "header" }
        })).AllowAnonymous();
        endpoints.MapMcp("/mcp").RequireAuthorization(DemoSettings.Policy)
            .WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(32768));
    }
}

public sealed class DemoClientRegistrationLock
{
    public SemaphoreSlim Gate { get; } = new(1, 1);
}
