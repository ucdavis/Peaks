using System;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;

namespace Keas.Mvc.Helpers
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted(); // TODO: remove
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialzied

            var user = new User {Id = "123124", FirstName = "Scott", Name = "Scott Kirkland", Email = "scott@email.com"};
            var team = new Team {Id = 1, TeamName = "CAES DO"};

            context.Users.Add(user);
            context.Teams.Add(team);
            context.TeamMemberships.Add(new TeamMembership { User = user, Team = team, Role = "Admin" });

            context.SaveChanges();
            
        }
    }
}