using System.Linq;
using System;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Database;

public static class SandboxSeed
{
    public static async Task RunAsync(string connectionString)
    {
        var target = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connectionString);
        if (Environment.GetEnvironmentVariable("PEAKS_SANDBOX") != "1"
            || target.InitialCatalog != "PeaksSandbox"
            || target.DataSource != "sql")
            throw new InvalidOperationException("Sandbox seeding requires PEAKS_SANDBOX=1 and the Compose sql/PeaksSandbox target.");
        await using var context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString, sql => sql.UseCompatibilityLevel(140)).Options);
        if (!(await context.Database.GetAppliedMigrationsAsync()).Contains(DatabaseCommands.BaselineId))
            throw new InvalidOperationException("Apply the baseline before seeding the sandbox.");
        await using var transaction = await context.Database.BeginTransactionAsync();
        foreach (var id in new[] { "sandbox-admin", "sandbox-basic" })
            if (!await context.Users.AnyAsync(u => u.Id == id))
                context.Users.Add(new User { Id = id, FirstName = "Sandbox", LastName = id == "sandbox-admin" ? "Admin" : "Basic", Email = id + "@example.test" });
        var team = await context.Teams.SingleOrDefaultAsync(t => t.Slug == "sandbox");
        if (team == null)
        {
            team = new Team { Name = "Sandbox Team", Slug = "sandbox" };
            context.Teams.Add(team);
        }
        await context.SaveChangesAsync();
        var role = await context.Roles.SingleOrDefaultAsync(r => r.Name == "DepartmentalAdmin");
        if (role == null)
        {
            role = new Role { Name = "DepartmentalAdmin" };
            context.Roles.Add(role);
            await context.SaveChangesAsync();
        }
        if (!await context.TeamPermissions.AnyAsync(p => p.TeamId == team.Id && p.UserId == "sandbox-admin" && p.RoleId == role.Id))
            context.TeamPermissions.Add(new TeamPermission { TeamId = team.Id, UserId = "sandbox-admin", RoleId = role.Id });
        if (!await context.People.AnyAsync(p => p.TeamId == team.Id && p.UserId == "sandbox-admin"))
            context.People.Add(new Person { TeamId = team.Id, UserId = "sandbox-admin", FirstName = "Sandbox", LastName = "Admin", Email = "sandbox-admin@example.test" });
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        Console.WriteLine("Sandbox fixtures ready. Users: sandbox-admin and sandbox-basic. Team: sandbox.");
    }
}
