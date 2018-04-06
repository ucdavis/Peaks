using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Controllers
{
    public class TeamAdminController : SuperController
    {
        // TODO: Authorize to appropriate roles. Maybe just require DA?

        private readonly ApplicationDbContext _context;

        public TeamAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> RoledMembers()
        {
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=>tp.TeamRole)
                .SingleAsync(x => x.Name == Team);
            
            var viewModel = TeamAdminMembersListModel.Create(team);
            return View(viewModel);
        }

        public async Task<IActionResult> AddMemberRole()
        {
            var team = await _context.Teams.SingleAsync(x => x.Name == Team);
            
            var viewModel = TeamAdminMembersAddModel.Create(team, _context);
            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> AddMemberRole(TeamAdminMembersAddModel model)
        {
            var team = await _context.Teams.SingleAsync(x => x.Name == Team);
            var viewModel = TeamAdminMembersAddModel.Create(team, _context);
            if (team == null)
            {
                return NotFound();
            }
            if (model.RoleId == 0)
            {
                ModelState.AddModelError("RoleId", "Must select valid Role");
                return View(viewModel);
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.UserEmail);
            var role = await _context.Roles.SingleOrDefaultAsync(r => r.Id == model.RoleId);
            
            if (user == null)
            {
                ModelState.AddModelError("UserEmail", "User not found!");
                return View(viewModel);
            }

            if (role == null)
            {
                ModelState.AddModelError("RoleId", "Role not found!");
                return View(viewModel);
            }

            var existingTeamPermision =
                await _context.TeamPermissions.SingleOrDefaultAsync(tp =>
                    tp.Team == team && tp.TeamRole == role && tp.User == user);

            if (existingTeamPermision != null)
            {
                ModelState.AddModelError(string.Empty,"User already in that role!");
                return View(viewModel);
            }

            var teamPermission = new TeamPermission {TeamRole = role, Team = team, User = user};
            if (ModelState.IsValid)
            {
                _context.TeamPermissions.Add(teamPermission);
                await _context.SaveChangesAsync();

                // TODO: uncomments when service message PR merged.
                //Message = "User " + user.Name + " has been added as " + role.Name + " to the " + team.Name " team.";

                return RedirectToAction(nameof(RoledMembers));
            }
            
            return View(viewModel);
        }


        public async Task<IActionResult> BulkImportMembers()
        {
            //TODO: Import from IAM using FIS Org code => PPS Dept ID => IAM bulk load call
            throw new NotImplementedException();
        }



    }
}