using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Keas.Core.Data
{
    // Tooling always targets SQL Server, regardless of the web app's local SQLite setting.
    // Generating migrations does not connect; applying them requires an explicit connection.
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            const string connection = "Server=localhost;Database=PeaksMigrationDesign;Integrated Security=True;TrustServerCertificate=True";
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connection, sql => sql.UseCompatibilityLevel(140))
                .Options;
            return new ApplicationDbContext(options);
        }
    }
}
