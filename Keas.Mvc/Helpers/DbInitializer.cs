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
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialzied

            var user = new User {Id = "123124", Name = "Scott Kirkland", Email = "scott@email.com"};
            var supervisor = new User { Id = "321421", Name = "Adam Getchell", Email = "adam@email.com"};
            var team = new Team {Id = 1, TeamName = "CAES DO"};
            var teamMember = new TeamMember {Id = 1, Team = team, User = user};
            var teamMemberSupervisor = new TeamMember {Id = 2, Team = team, User = supervisor};
            var teamRole = new TeamRole {Name = "Team Admin", User = user, Team = team};
            var location = new Location {Id = 1, Name = "12 Mrak", Type = "Room"};
            var assignment = new Assignment {Id = 1, StartDate = DateTime.Now.AddMonths(-2), TeamMember = teamMember, Supervisor = teamMemberSupervisor };
            var asset = new Asset {Id = 1, Type = "Computer", AssignedToTeamMember = teamMember, AssignedByTeamMember = teamMemberSupervisor};

            context.Users.Add(user);
            context.Users.Add(supervisor);
            context.Teams.Add(team);
            context.TeamMembers.Add(teamMember);
            context.TeamMembers.Add(teamMemberSupervisor);
            context.TeamRoles.Add(teamRole);
            context.Locations.Add(location);
            context.Assignments.Add(assignment);
            context.Assets.Add(asset);

            context.SaveChanges();
            
        }
    }
}