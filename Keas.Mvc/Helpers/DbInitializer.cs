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

            var user = new User {Id = "123124", FirstName = "Scott", Name = "Scott Kirkland", Email = "scott@email.com"};
            var supervisor = new User { Id = "321421", Name = "Adam Getchell", Email = "adam@email.com"};
            var team = new Team {Id = 1, TeamName = "CAES DO"};
            var teamMember = new TeamMember {Id = 1, Team = team, User = user};
            var teamMemberSupervisor = new TeamMember {Id = 2, Team = team, User = supervisor};
            var teamRole = new TeamRole {Name = "Team Admin", TeamMember = teamMemberSupervisor};
            var locationCampus = new Location {Id = 1, Name = "Davis Campus", Type = "Campus"};
            var locationBuilding = new Location {Id = 2, Name = "Mrak", Type = "Building", ParentLocation = locationCampus};
            var locationRoom = new Location {Id = 3, Name = "12", ParentLocation = locationBuilding, Type = "Room"};
            var assignment = new Assignment {Id = 1, StartDate = DateTime.Now.AddMonths(-2), Assignee = teamMember, Supervisor = teamMemberSupervisor };
            var asset = new Asset {Id = 1, Type = "Computer", AssignedToTeamMember = teamMember, AssignedByTeamMember = teamMemberSupervisor, Location = locationRoom};

            context.Users.Add(user);
            context.Users.Add(supervisor);
            context.Teams.Add(team);
            context.TeamMembers.Add(teamMember);
            context.TeamMembers.Add(teamMemberSupervisor);
            context.TeamRoles.Add(teamRole);
            context.Locations.Add(locationCampus);
            context.Locations.Add(locationBuilding);
            context.Locations.Add(locationRoom);
            context.Assignments.Add(assignment);
            context.Assets.Add(asset);

            context.SaveChanges();
            
        }
    }
}