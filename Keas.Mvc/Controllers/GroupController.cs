using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class GroupController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IReportService _reportService;

        public GroupController(ApplicationDbContext context, IReportService reportService)
        {
            _context = context;
            _reportService = reportService;
        }
        public async Task<IActionResult> Index(int id)
        {
            var group = await _context.Groups.SingleOrDefaultAsync(a =>
                a.Id == id && a.GroupPermissions.Any(w => w.UserId == User.Identity.Name));

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            return View(group);
        }

        public async Task<IActionResult> WorkstationReport(int id)
        {
            // TODO: create auth policy for group membership
            var group = await _context.Groups.SingleOrDefaultAsync(a =>
                a.Id == id && a.GroupPermissions.Any(w => w.UserId == User.Identity.Name));

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var worstations = await _reportService.WorkStations(group);

            return View(worstations);
        }
    }
}
