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
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Name == Team);
            var teampermissions = _context.TeamPermissions
                .Include(tp => tp.User)
                .Include(tp => tp.TeamRole)
                .Where(x=> x.Team==team).ToList();

            if (team == null)
            {
                return NotFound();
            }
            //var viewModel = TeamAdminMembersListModel.Create(_context, teampermissions);
            return View(teampermissions);
        }
  
        public class TeamAdminMembersListModel
        {
            public TeamPermission TeamPermission { get; set; }
           
            public List<UserRoles> UserRoleses { get; set; }
            public string TeamName { get; set; }

            public static TeamAdminMembersListModel Create(ApplicationDbContext context, TeamPermission teamPermission)
            {
                var viewModel = new TeamAdminMembersListModel()
                {
                    TeamPermission = teamPermission,
                    UserRoleses = new List<UserRoles>(),
                    TeamName =  teamPermission.Team.Name
                };

                viewModel.UserRoleses.Add(new UserRoles(teamPermission));

                return viewModel;
            }

        }

        public class UserRoles
        {
            public User User { get; set; }
           
            public IList<Role> Roles { get; set; }

            public UserRoles(TeamPermission teamPermission)
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