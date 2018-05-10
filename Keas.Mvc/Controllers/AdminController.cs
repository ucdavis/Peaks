using System.Linq;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
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
    }
}