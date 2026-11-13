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
    public string Resource => new Uri(Issuer, "mcp").AbsoluteUri;

    public static DemoSettings Read(IConfiguration configuration, IHostEnvironment environment)
    {
        if (!configuration.GetValue<bool>("McpDemo:Enabled")) return null;
        var sql = new SqlConnectionStringBuilder(configuration.GetConnectionString("DefaultConnection"));
        if (!environment.IsDevelopment() || !configuration.GetValue<bool>("LocalLogin:Enabled") ||
            configuration["PEAKS_SANDBOX"] != "1" || sql.DataSource != "sql" || sql.InitialCatalog != "PeaksSandbox")
            throw new InvalidOperationException("MCP demo requires the Development Docker sandbox and local login.");
        if (!Uri.TryCreate(configuration["McpDemo:Issuer"], UriKind.Absolute, out var issuer) ||
            issuer.Scheme != "https" || issuer.Host != "localhost" || issuer.AbsolutePath != "/" ||
            issuer.Query.Length != 0 || issuer.Fragment.Length != 0 || issuer.UserInfo.Length != 0)
            throw new InvalidOperationException("McpDemo:Issuer must be an HTTPS localhost origin.");
        return new DemoSettings(issuer,
            configuration["McpDemo:DatabasePath"] ?? "/home/app/.aspnet/DataProtection-Keys/peaks-mcp.db",
            configuration["Kestrel:Certificates:Default:Path"] ?? throw new InvalidOperationException("A local TLS certificate is required."),
            configuration["Kestrel:Certificates:Default:Password"]);
    }
}
