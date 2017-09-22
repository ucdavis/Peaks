using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;

namespace Keas.Mvc.Helpers
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialzied

            var user = new User {Id = "123124", Name = "Scott Kirkland", Email = "scott@email.com"};
            var team = new Team {Id = 1, TeamName = "CAES DO"};
            var teamMember = new TeamMember {Id = 1, Team = team, User = user};
            var teamRole = new TeamRole {Name = "Team Admin", User = user, Team = team};
            var location = new Location {Id = 1, Name = "12 Mrak", Type = "Room"};

            context.Users.Add(user);
            context.Teams.Add(team);
            context.TeamMembers.Add(teamMember);
            context.TeamRoles.Add(teamRole);

            context.SaveChanges();
            
        }
    }
}