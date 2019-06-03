using System.Linq;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Keas.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Keas.Mvc.Services;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.SystemAdminAccess)]
    public class AdminController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;

        private readonly IUserService _userService;

        public AdminController(ApplicationDbContext context, IIdentityService identityService, IUserService userService)
        {
            _context = context;
            _identityService = identityService;
            _userService = userService;
        }

        public async Task<IActionResult> Index()
        {
            var model = new TeamsAndGroupsModel();
            model.Teams = await _context.Teams.ToListAsync();
            model.Groups = await _context.Groups.ToListAsync();

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
                var systemPermission =
                    await _context.SystemPermissions.SingleAsync(sptd => sptd.RoleId == role && sptd.UserId == userId);
                _context.SystemPermissions.Remove(systemPermission);
            }
            await _context.SaveChangesAsync();
            Message = "User removed from role.";
            return RedirectToAction(nameof(RoledMembers));
        }
    }
}
