using System;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Keas.Mvc.Mcp;

public sealed record DemoSettings(Uri Issuer, string DatabasePath, string CertificatePath, string CertificatePassword)
{
    public const string Scope = "peaks.inventory.read";
    public const string TeamSlug = "sandbox";
    public const string Policy = "PeaksMcpDemo";
    public const string DeadlineClaim = "peaks:grant-deadline";
    public const string ChatGptCallback = "https://chatgpt.com/connector_platform_oauth_redirect";
    public bool AllowNgrok { get; init; }
    public string ChatGptRedirectUri { get; init; }
    public string Resource => new Uri(Issuer, "mcp").AbsoluteUri;

    public static DemoSettings Read(IConfiguration configuration, IHostEnvironment environment)
    {
        if (!configuration.GetValue<bool>("McpDemo:Enabled")) return null;
        var sql = new SqlConnectionStringBuilder(configuration.GetConnectionString("DefaultConnection"));
        if (!environment.IsDevelopment() || !configuration.GetValue<bool>("LocalLogin:Enabled") ||
            configuration["PEAKS_SANDBOX"] != "1" || sql.DataSource != "sql" || sql.InitialCatalog != "PeaksSandbox")
            throw new InvalidOperationException("MCP demo requires the Development Docker sandbox and local login.");
        var allowNgrok = configuration.GetValue<bool>("McpDemo:AllowNgrok");
        if (!Uri.TryCreate(configuration["McpDemo:Issuer"], UriKind.Absolute, out var issuer) ||
            issuer.Scheme != "https" || (issuer.Host != "localhost" && !(allowNgrok && IsNgrokHost(issuer.Host) && issuer.IsDefaultPort)) || issuer.AbsolutePath != "/" ||
            issuer.Query.Length != 0 || issuer.Fragment.Length != 0 || issuer.UserInfo.Length != 0)
            throw new InvalidOperationException("McpDemo:Issuer must be an HTTPS localhost origin, or an ngrok HTTPS origin with McpDemo:AllowNgrok enabled.");
        var callback = configuration["McpDemo:ChatGptRedirectUri"];
        if (!string.IsNullOrEmpty(callback) && (!allowNgrok || !IsChatGptCallback(callback)))
            throw new InvalidOperationException("McpDemo:ChatGptRedirectUri must be the exact ChatGPT OAuth callback and requires ngrok mode.");
        return new DemoSettings(issuer,
            configuration["McpDemo:DatabasePath"] ?? "/home/app/.aspnet/DataProtection-Keys/peaks-mcp.db",
            configuration["Kestrel:Certificates:Default:Path"] ?? throw new InvalidOperationException("A local TLS certificate is required."),
            configuration["Kestrel:Certificates:Default:Password"])
        { AllowNgrok = allowNgrok, ChatGptRedirectUri = callback };
    }

    private static bool IsNgrokHost(string host) => host.EndsWith(".ngrok-free.app", StringComparison.Ordinal) ||
        host.EndsWith(".ngrok-free.dev", StringComparison.Ordinal) || host.EndsWith(".ngrok.app", StringComparison.Ordinal) ||
        host.EndsWith(".ngrok.dev", StringComparison.Ordinal);

    private static bool IsChatGptCallback(string value)
    {
        if (value == ChatGptCallback) return true;
        const string prefix = "https://chatgpt.com/connector/oauth/";
        if (!value.StartsWith(prefix, StringComparison.Ordinal) || value.Length == prefix.Length) return false;
        foreach (var character in value.Substring(prefix.Length))
            if (!char.IsAsciiLetterOrDigit(character) && character != '-' && character != '_') return false;
        return true;
    }

    public bool AllowsHostedRedirect(string value) => AllowNgrok &&
        (value == ChatGptCallback || (!string.IsNullOrEmpty(ChatGptRedirectUri) && value == ChatGptRedirectUri));
}
