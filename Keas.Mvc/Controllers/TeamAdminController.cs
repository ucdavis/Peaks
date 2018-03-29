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

            if (team == null)
            {
                return NotFound();
            }
            var viewModel = TeamAdminMembersListModel.Create(_context, team);
            return View(viewModel);
        }
  
        public class TeamAdminMembersListModel
        {
            public Team Team { get; set; }
            public List<TeamRoles> Roles { get; set; }

            public static TeamAdminMembersListModel Create(ApplicationDbContext context, Team team)
            {
                var viewModel = new TeamAdminMembersListModel()
                {
                    Team = team,
                    Roles = new List<TeamRoles>()
                };

                return viewModel;
            }

        }

        public class TeamRoles
        {
            public Person Person { get; set; }
            public IList<Role> Roles { get; set; }

            public TeamRoles(TeamPermission teamPermission)
            {
                Person = teamPermission.Person;
                Roles = new List<Role>
                {
                    teamPermission.TeamRole
                };
            }

            public string RolesList
            {
                get { return string.Join(", ", Roles.OrderBy(x => x.Name).Select(a => a.Name).ToArray()); }
            }
        }
    }
}