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

        public TeamAdminController(ApplicationDbContext context, IIdentityService identityService)
        {
            _context = context;
            _identityService = identityService;
        }

        public async Task<IActionResult> Index()
        {
            var team = await _context.Teams
                .Include(o=> o.FISOrgs)
                .SingleOrDefaultAsync(x => x.Name == Team);

            return View(team);
        }

        public IActionResult AddFISOrg()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddFISOrg(FISOrgAddModel model)
        {
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Name == Team);
            if (team == null)
            {
                return NotFound();
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
            var fisOrg = await _context.FISOrgs.Include(t=> t.Team).SingleAsync(f => f.Id == fisorgId && f.Team.Name == Team);
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
                .SingleAsync(x => x.Name == Team);
            
            var viewModel = TeamAdminMembersListModel.Create(team,null);
            return View(viewModel);
        }

        public async Task<IActionResult> AddMemberRole()
        {
            var team = await _context.Teams.SingleAsync(x => x.Name == Team);
            
            var viewModel = await TeamAdminMembersAddModel.Create(team, _context);
            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> AddMemberRole(TeamAdminMembersAddModel model)
        {
            var team = await _context.Teams.SingleAsync(x => x.Name == Team);
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
                .SingleAsync(x => x.Name == Team);
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
                var teamPermssionToDelete = _context.TeamPermissions.Single(tptd => tptd.RoleId == role && tptd.UserId == userId && tptd.Team.Name==Team);
                _context.TeamPermissions.Remove(teamPermssionToDelete);
            }
            await _context.SaveChangesAsync();
            Message = "User removed from role.";
            // TODO: Any reason to be more specific? E.g. "John removed from role(s) Keymaster,EquipMaster on team CAESDO".
            return RedirectToAction(nameof(RoledMembers));
        }


        public async Task<IActionResult> Members()
        {
            var model = await _context.People.Where(p=> p.Team.Name==Team).ToListAsync();

            return View(model);
        }

        public async Task<IActionResult> DetailsMember(int id)
        {
            var model = await _context.People.SingleAsync(x => x.Id == id);
            return View(model);
        }

        public async Task<IActionResult> SearchUser(string searchTerm)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var users = await _context.Users.Where(x => x.Email.IndexOf(searchTerm, comparison) >= 0
                || x.Id.IndexOf(searchTerm, comparison) >= 0) //case-insensitive version of .Contains
                .AsNoTracking().FirstOrDefaultAsync();
            if (users==null)
            {
                if(searchTerm.Contains("@"))
                {
                    var user = await _identityService.GetByEmail(searchTerm);
                    return Json(user);
                }
                else
                {
                    var user = await _identityService.GetByKerberos(searchTerm);
                    return Json(user);
                }
            }
            return Json(users);
        }
        
        public IActionResult CreateMember()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateMember(CreateMemberPersonModel person)
        {
            if (ModelState.IsValid)
            {
                var exisitngPerson =
                    await _context.People.SingleOrDefaultAsync(p => p.Team.Name == Team && p.UserId == person.User.Id);
                if (exisitngPerson != null)
                {
                    Message = "User is already a member of this team!";
                    return RedirectToAction(nameof(EditMember), new {id = exisitngPerson.Id});
                }
                var user = person.User;
                var existingUser = await _context.Users.Where(x => x.Id == user.Id).AnyAsync();
                if (!existingUser)
                {
                    var newUser = new User
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email
                    };
                    _context.Users.Add(newUser);
                }
                var team = await _context.Teams.SingleAsync(t => t.Name == Team);
                var newPerson = new Person
                {
                    Team = team,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    UserId = user.Id,
                    Group = person.Group,
                    Title = person.Title,
                    HomePhone = person.HomePhone,
                    TeamPhone = person.TeamPhone
                };
                _context.People.Add(newPerson);
                await _context.SaveChangesAsync();
                Message = newPerson.User.Name + " added to team.";


                return RedirectToAction(nameof(Members));
            }
            return View();
        }

        public async Task<IActionResult> EditMember(int id)
        {
            var model = await _context.People.Include(p => p.User).SingleAsync(x => x.Id == id);
            return View(model);
        }

        [HttpPost, ActionName("EditMember")]
        public async Task<IActionResult> EditMemberPost(int id)
        {
            if (id == null)
            {
                return NotFound();
            }
            var personToEdit = await _context.People.SingleAsync(x => x.Id == id);

           
            if (await TryUpdateModelAsync<Person>(personToEdit, "", t => t.FirstName, t => t.LastName, t => t.Active, t=> t.Group, t=> t.Title, t=> t.HomePhone, t=> t.TeamPhone))
            {
                try
                {
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Members));
                }
                catch
                {
                    ModelState.AddModelError("", "Unable to save changes.");
                }
            }
            Message = "Something failed in the update.";
             var model = await _context.People.Include(p => p.User).SingleAsync(x => x.Id == id);
            return View(model);
            
        }

        public  IActionResult BulkImportMembers()
        {
            //TODO: Import from IAM using FIS Org code => PPS Dept ID => IAM bulk load call
            throw new NotImplementedException();
        }



    }
}