using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = "DepartmentAdminAccess")]
    public class TeamAdminController : SuperController
    {
        // TODO: Authorize to appropriate roles. Maybe just require DA or SystemAdmin?

        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        private readonly IUserService _userService;
        private readonly IFinancialService _financialService;

        public TeamAdminController(ApplicationDbContext context, IIdentityService identityService, IUserService userService, IFinancialService financialService)
        {
            _context = context;
            _identityService = identityService;            
            _userService = userService;
            _financialService = financialService;
        }

        public async Task<IActionResult> Index()
        {
            var team = await _context.Teams
                .Include(o=> o.FISOrgs)
                .SingleOrDefaultAsync(x => x.Slug == Team);

            return View(team);
        }

        public IActionResult AddFISOrg()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddFISOrg(FISOrgAddModel model)
        {
            model.OrgCode = model.OrgCode.ToUpper();
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }
            if (!await _financialService.ValidateFISOrg(model.Chart, model.OrgCode))
            {
                    ModelState.AddModelError("OrgCode", "Chart and OrgCode are not valid");
            }
        
            var FISOrg = new FinancialOrganization { Chart = model.Chart, OrgCode = model.OrgCode, Team = team};
            
            if (ModelState.IsValid)
            {
                _context.FISOrgs.Add(FISOrg);
                await _context.SaveChangesAsync();
                Message = "New FIS Org added to team.";
                return RedirectToAction(nameof(Index));
            }
            return View();
        }

        public async Task<IActionResult> RemoveFISOrg(int fisorgId)
        {
            var fisOrg = await _context.FISOrgs.Include(t=> t.Team).SingleAsync(f => f.Id == fisorgId && f.Team.Slug == Team);
            if (fisOrg == null)
            {
                Message = "FIS Org not found or not attached to this team";
                return RedirectToAction(nameof(Index));
            }
            return View(fisOrg);
           
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFISOrg(FinancialOrganization org)
        {
            _context.Remove(org);
            await _context.SaveChangesAsync();
            Message = "FIS Org removed";
            return RedirectToAction(nameof(Index));


        }

        public async Task<IActionResult> RoledMembers()
        {
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=>tp.Role)
                .SingleAsync(x => x.Slug == Team);
            
            var viewModel = TeamAdminMembersListModel.Create(team,null);
            return View(viewModel);
        }

        public async Task<IActionResult> AddMemberRole()
        {
            var team = await _context.Teams.SingleAsync(x => x.Slug == Team);
            
            var viewModel = await TeamAdminMembersAddModel.Create(team, _context);
            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> AddMemberRole(TeamAdminMembersAddModel model)
        {
            var team = await _context.Teams.SingleAsync(x => x.Slug == Team);
            var viewModel = await TeamAdminMembersAddModel.Create(team, _context);
            if (team == null)
            {
                return NotFound();
            }
            if (model.RoleId == 0)
            {
                ModelState.AddModelError("RoleId", "Must select valid Role");
                return View(viewModel);
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.UserEmail || u.Id == model.UserEmail);
            var role = await _context.Roles.SingleOrDefaultAsync(r => r.Id == model.RoleId);
            
            if (user == null)
            {
                if(model.UserEmail.Contains("@")){
                   user = await _userService.CreateUserFromEmail(model.UserEmail);
                } else
                {
                   user = await _userService.CreateUserFromKerberos(model.UserEmail);
                }
            }

            // Check if already Team Person. Add if not.
            var person = await _context.People.SingleOrDefaultAsync(p => p.UserId == user.Id && p.TeamId == team.Id);
            if (person == null) 
            {
                person = new Person();
                person.TeamId = team.Id;
                person.UserId = user.Id;
                person.FirstName = user.FirstName;
                person.LastName = user.LastName;
                person.Email = user.Email;
                _context.People.Add(person);
                await _context.SaveChangesAsync();
            }

            if (role == null)
            {
                ModelState.AddModelError("RoleId", "Role not found!");
                return View(viewModel);
            }

            var existingTeamPermision =
                await _context.TeamPermissions.SingleOrDefaultAsync(tp =>
                    tp.Team == team && tp.Role == role && tp.User == user);

            if (existingTeamPermision != null)
            {
                ModelState.AddModelError(string.Empty,"User already in that role!");
                return View(viewModel);
            }

            var teamPermission = new TeamPermission {Role = role, Team = team, User = user};
            if (ModelState.IsValid)
            {
                _context.TeamPermissions.Add(teamPermission);
                await _context.SaveChangesAsync();
                Message = "User " + user.Name + " has been added as " + role.Name + " to the " + team.Name + " team.";
                return RedirectToAction(nameof(RoledMembers));
            }
            
            return View(viewModel);
        }

        public async Task<ActionResult> RemoveRoles(string userId)
        {
            if (userId == null)
            {
                Message = "User not provided";
                return RedirectToAction(nameof(RoledMembers));
            }
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                .ThenInclude(tp => tp.User)
                .Include(t => t.TeamPermissions)
                .ThenInclude(tp => tp.Role)
                .SingleAsync(x => x.Slug == Team);
            var viewModel = TeamAdminMembersListModel.Create(team, userId);

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> RemoveRoles(string userId, int[] roles)
        {
            // TODO: any roles we should not list? Any roles we should not allow deleted?
            if (userId == null)
            {
                Message = "User not found!";
                return RedirectToAction(nameof(RoledMembers));
            }
            
            if (roles.Length < 1)
            {
                Message = "Must select a role to remove.";
                return RedirectToAction(nameof(RemoveRoles), new {userId = userId});
            }
            
            foreach (var role in roles)
            {
                var teamPermssionToDelete = _context.TeamPermissions.Single(tptd => tptd.RoleId == role && tptd.UserId == userId && tptd.Team.Slug==Team);
                _context.TeamPermissions.Remove(teamPermssionToDelete);
            }
            await _context.SaveChangesAsync();
            Message = "User removed from role.";
            // TODO: Any reason to be more specific? E.g. "John removed from role(s) Keymaster,EquipMaster on team CAESDO".
            return RedirectToAction(nameof(RoledMembers));
        }

        public IActionResult BulkLoadPeople() 
        {
            return View();
        }

        public async Task<IActionResult> LoadPeople(string ppsDeptCode)
        {
            Message = await _identityService.BulkLoadPeople(ppsDeptCode, Team);            
            return RedirectToAction(nameof(Index));
        }



    }
}