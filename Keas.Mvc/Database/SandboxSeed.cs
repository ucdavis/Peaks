using System.Linq;
using System.Collections.Generic;
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
        if (!await context.People.IgnoreQueryFilters().AnyAsync(p => p.TeamId == team.Id && p.UserId == "sandbox-admin"))
            context.People.Add(new Person { TeamId = team.Id, UserId = "sandbox-admin", FirstName = "Sandbox", LastName = "Admin", Email = "sandbox-admin@example.test" });
        await context.SaveChangesAsync();
        await SeedDemoDataAsync(context, team);
        await transaction.CommitAsync();
        Console.WriteLine("Sandbox fixtures ready. Users: sandbox-admin and sandbox-basic. Team: sandbox. Demo people, assets and assignments are ready.");
    }

    private static async Task SeedDemoDataAsync(ApplicationDbContext context, Team team)
    {
        // Stable identifiers make rebuilds additive and preserve edits made while testing the UI.
        var today = DateTime.UtcNow.Date;
        var names = new[]
        {
            ("Maya", "Chen"), ("Javier", "Morales"), ("Aisha", "Patel"), ("Noah", "Williams"),
            ("Sofia", "Nguyen"), ("Ethan", "Brooks"), ("Amara", "Okafor"), ("Liam", "Garcia"),
            ("Isabel", "Rivera"), ("Oliver", "Kim"), ("Zoe", "Thompson"), ("Lucas", "Martinez"),
            ("Priya", "Shah"), ("Benjamin", "Lee"), ("Chloe", "Anderson"), ("Mateo", "Hernandez"),
            ("Nadia", "Hassan"), ("Theo", "Wilson"), ("Elena", "Petrov"), ("Samuel", "Davis"),
            ("Grace", "O'Neill"), ("Andre", "Robinson"), ("Mei", "Zhang"), ("Alex", "Santos-Lopez"),
            ("Fatima", "Ali"), ("Daniel", "Park"), ("Camila", "Torres"), ("Rowan", "Miller"),
            ("Leila", "Rahman"), ("Julian", "Scott"), ("Eva", "Martin"), ("Kai", "Johnson")
        };
        var categories = new[] { "Faculty", "Staff", "Research", "Grad Student", "Postdoc", "Undergrad", "Visitor", "Admin Staff" };
        var titles = new[] { "Associate Professor", "Program Coordinator", "Research Specialist", "Graduate Researcher", "Postdoctoral Scholar", "Student Assistant", "Visiting Scholar", "Department Administrator" };
        var people = new List<Person>();
        for (var i = 0; i < names.Length; i++)
        {
            var userId = $"sandbox-person-{i + 1:00}";
            var person = await context.People.IgnoreQueryFilters().SingleOrDefaultAsync(p => p.TeamId == team.Id && p.UserId == userId);
            if (person == null)
            {
                var (first, last) = names[i];
                var email = $"{userId}@example.test";
                if (!await context.Users.AnyAsync(u => u.Id == userId))
                    context.Users.Add(new User { Id = userId, FirstName = first, LastName = last, Email = email });
                person = new Person
                {
                    Team = team, UserId = userId, FirstName = first, LastName = last, Email = email,
                    Category = categories[i % categories.Length], Title = titles[i % titles.Length],
                    Tags = i % 2 == 0 ? "Research,Field work" : "Administration",
                    TeamPhone = i % 4 == 0 ? null : $"53055501{i:00}",
                    StartDate = today.AddDays(-30 * (i + 1)),
                    EndDate = i % 7 == 0 ? today.AddDays(21) : null,
                    Active = i < 30,
                    Notes = i % 3 == 0 ? "Fictional sandbox record. Splits time between field research and the main office." : null,
                    Supervisor = i > 1 ? people[i % 2] : null
                };
                context.People.Add(person);
            }
            people.Add(person);
        }
        foreach (var name in new[] { "Research", "Field work", "Administration", "Loan pool", "Shared" })
            if (!await context.Tags.AnyAsync(t => t.TeamId == team.Id && t.Name == name))
                context.Tags.Add(new Tag { Team = team, Name = name });
        await context.SaveChangesAsync();

        if (!await context.FISOrgs.AnyAsync(o => o.TeamId == team.Id && o.OrgCode == "SBX1"))
            context.FISOrgs.Add(new FinancialOrganization { Team = team, Chart = "3", OrgCode = "SBX1" });
        var spaces = new List<Space>();
        for (var i = 0; i < 12; i++)
        {
            var roomKey = $"sandbox-room-{i + 1:00}";
            var space = await context.Spaces.IgnoreQueryFilters().SingleOrDefaultAsync(s => s.RoomKey == roomKey);
            if (space == null)
            {
                space = new Space
                {
                    RoomKey = roomKey, BldgKey = i < 6 ? "sandbox-north" : "sandbox-south",
                    BldgName = i < 6 ? "North Research Hall" : "South Field Station",
                    RoomNumber = $"{100 + i}", RoomName = i % 3 == 0 ? "Shared Research Lab" : "Faculty and Staff Office",
                    FloorKey = "1", FloorName = "First floor", DeptKey = "sandbox", DeptName = team.Name,
                    Source = "Team", ChartNum = "3", OrgId = "SBX1", SqFt = 120 + i * 35
                };
                context.Spaces.Add(space);
            }
            spaces.Add(space);
        }
        await context.SaveChangesAsync();

        var models = new[]
        {
            ("Laptop", "Dell", "Latitude 7450"), ("Laptop", "Apple", "MacBook Pro 14"),
            ("Desktop", "Lenovo", "ThinkCentre M90"), ("Display", "Dell", "UltraSharp 27"),
            ("Tablet", "Apple", "iPad Air"), ("Printer", "HP", "LaserJet Pro"),
            ("Device", "Garmin", "GPSMAP 67"), ("Accessory", "Logitech", "Brio Webcam")
        };
        for (var i = 0; i < 64; i++)
        {
            var serial = $"SBX-EQ-{i + 1:0000}";
            if (await context.Equipment.IgnoreQueryFilters().AnyAsync(e => e.TeamId == team.Id && e.SerialNumber == serial)) continue;
            var (type, make, model) = models[i % models.Length];
            var equipment = new Equipment
            {
                Team = team, Name = $"{model} - {i + 1:00}", Type = type, Make = make, Model = model,
                SerialNumber = serial, Space = i % 5 == 0 ? null : spaces[i % spaces.Count],
                Tags = i < 48 ? "Research" : "Loan pool,Shared", ProtectionLevel = "P2", AvailabilityLevel = "A1",
                Notes = i % 9 == 0 ? "Shared field kit. Return with charger, carrying case, and adapters." : null,
                Active = i < 62
            };
            if (i < 48) equipment.Assignment = Assignment<EquipmentAssignment>(people[i % 24], i, today);
            if (type == "Laptop" || type == "Desktop") equipment.AddAttribute("Service Tag", $"SBX{i + 1:0000}");
            context.Equipment.Add(equipment);
        }
        for (var i = 0; i < 32; i++)
        {
            var name = $"Research desk {i + 1:00}";
            if (await context.Workstations.IgnoreQueryFilters().AnyAsync(w => w.TeamId == team.Id && w.Name == name)) continue;
            var desk = new Workstation { Team = team, Name = name, Type = "Desk", Space = spaces[i % spaces.Count], Tags = i % 2 == 0 ? "Research" : "Shared" };
            if (i < 24) desk.Assignment = Assignment<WorkstationAssignment>(people[i], i, today);
            context.Workstations.Add(desk);
        }
        for (var i = 0; i < 12; i++)
        {
            var code = $"SBX-K-{i + 1:00}";
            var key = await context.Keys.IgnoreQueryFilters().SingleOrDefaultAsync(k => k.TeamId == team.Id && k.Code == code);
            if (key == null)
            {
                key = new Key { Team = team, Code = code, Name = $"{spaces[i].RoomName} {spaces[i].RoomNumber}", Tags = "Research" };
                context.Keys.Add(key);
                context.KeyXSpaces.Add(new KeyXSpace { Key = key, Space = spaces[i] });
                await context.SaveChangesAsync();
            }
            for (var copy = 0; copy < 4; copy++)
            {
                var number = $"{code}-{copy + 1:00}";
                if (await context.KeySerials.AnyAsync(s => s.TeamId == team.Id && s.Number == number)) continue;
                var serial = new KeySerial { Team = team, Key = key, Name = number, Number = number,
                    Status = copy == 3 && i % 3 == 0 ? "Lost" : "Active" };
                if (copy < 2) serial.KeySerialAssignment = Assignment<KeySerialAssignment>(people[i * 2 + copy], i * 2 + copy, today);
                context.KeySerials.Add(serial);
                await context.SaveChangesAsync();
                // The UI uses both the relationship FK and this explicit current-assignment pointer.
                serial.KeySerialAssignmentId = serial.KeySerialAssignment?.Id;
            }
        }
        var accessNames = new[] { "Building card access", "After-hours lab access", "Research file share", "Department mailing list", "Equipment booking", "Field vehicle reservation", "Purchasing portal", "Safety training portal", "VPN access", "Compute cluster", "Shared calendar", "Visitor wireless" };
        for (var i = 0; i < accessNames.Length; i++)
        {
            if (await context.Access.IgnoreQueryFilters().AnyAsync(a => a.TeamId == team.Id && a.Name == accessNames[i])) continue;
            var access = new Access { Team = team, Name = accessNames[i], Tags = i % 2 == 0 ? "Research" : "Administration" };
            for (var j = 0; j < 6; j++) access.Assignments.Add(Assignment<AccessAssignment>(people[(i + j * 3) % 24], i + j, today));
            context.Access.Add(access);
        }
        await context.SaveChangesAsync();
    }

    private static T Assignment<T>(Person person, int scenario, DateTime today) where T : AssignmentBase, new()
    {
        var confirmed = scenario % 4 != 0;
        return new T
        {
            Person = person, RequestedById = "sandbox-admin", RequestedByName = "Sandbox Admin",
            RequestedAt = today.AddDays(-60), ApprovedAt = today.AddDays(-59),
            ExpiresAt = today.AddDays((scenario % 4) switch { 0 => 90, 1 => -14, 2 => 7, _ => 180 }),
            IsConfirmed = confirmed, ConfirmedAt = confirmed ? today.AddDays(-58) : null
        };
    }
}
