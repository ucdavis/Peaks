using System.Linq;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Authorization;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = "SystemAdminAccess")]
    public class AdminController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var model = await _context.Teams.ToListAsync();
            return View(model);
        }

        public async Task<IActionResult> RoledMembers()
        {
            var admins = await _context.SystemPermissions
                .Include(sp => sp.User)
                .Include(sp => sp.Role).ToListAsync();
            
            var viewModel = AdminMembersListModel.Create(admins, null);
            return View(viewModel);
        }

        public async Task<IActionResult> AddAdmin()
        {
            var model = await AdminMembersAddModel.Create(_context);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddAdmin(AdminMembersAddModel model)
        {
            var viewModel = await AdminMembersAddModel.Create(_context);
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

            var existingAdminRole =
                await _context.SystemPermissions.SingleOrDefaultAsync(sp => sp.Role == role && sp.User == user);
           if (existingAdminRole != null)
            {
                ModelState.AddModelError(string.Empty, "User already in that role!");
                return View(viewModel);
            }
            var systemPermission = new SystemPermission {Role = role, User = user};
            
            if (ModelState.IsValid)
            {
                _context.SystemPermissions.Add(systemPermission);
                await _context.SaveChangesAsync();
                Message = "User " + user.Name + " has been added as " + role.Name + ".";
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
            var systemPermission = await _context.SystemPermissions
                .Include(sp => sp.User)
                .Include(sp => sp.Role)
                .Where(x=> x.UserId==userId)
                .ToListAsync();
            var viewModel = AdminMembersListModel.Create(systemPermission, userId);
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
                return RedirectToAction(nameof(RemoveRoles), new { userId = userId });
            }

            foreach (var role in roles)
            {
                var teamPermssionToDelete = _context.TeamPermissions.Single(tptd => tptd.RoleId == role && tptd.UserId == userId && tptd.Team.Name == Team);
                _context.TeamPermissions.Remove(teamPermssionToDelete);
            }
            await _context.SaveChangesAsync();
            Message = "User removed from role.";
            // TODO: Any reason to be more specific? E.g. "John removed from role(s) Keymaster,EquipMaster on team CAESDO".
            return RedirectToAction(nameof(RoledMembers));
        }
    }
}