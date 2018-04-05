using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class TeamAdminController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public TeamAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Members()
        {
            //var team = await _context.Teams.SingleOrDefaultAsync(x => x.Name == Team);

            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=>tp.TeamRole)
                .SingleOrDefaultAsync(x => x.Name == Team);

            //var teampermissions = _context.TeamPermissions
            //    .Include(tp => tp.User)
            //    .Include(tp => tp.TeamRole)
            //    .AsNoTracking()
            //    .Where(x=> x.Team==team).ToList();

            if (team == null)
            {
                return NotFound();
            }
            var viewModel = TeamAdminMembersListModel.Create(team);
            return View(viewModel);
        }
  
        public class TeamAdminMembersListModel
        {
            public Team Team { get; set; }
           
            public List<UserRole> UserRoles { get; set; }

            public static TeamAdminMembersListModel Create(Team team)
            {
                var viewModel = new TeamAdminMembersListModel()
                {
                    Team = team,
                    UserRoles = new List<UserRole>()
                };

                foreach (var teamPersmision in team.TeamPermissions)
                {
                    viewModel.UserRoles.Add(new UserRole(teamPersmision));
                }
                

                return viewModel;
            }

        }

        public class UserRole
        {
            public User User { get; set; }
           
            public IList<Role> Roles { get; set; }

            public UserRole(TeamPermission teamPermission)
            {
                User = teamPermission.User;
                Roles = new List<Role>();
                Roles.Add(teamPermission.TeamRole);
            }

            public string RolesList
            {
                get { return string.Join(", ", Roles.OrderBy(x => x.Name).Select(a => a.Name).ToArray()); }
            }
        }
    }
}