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
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(sql => sql.UseCompatibilityLevel(140))
                .Options;
            return new ApplicationDbContext(options);
        }
    }
}
