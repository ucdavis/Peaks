using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models.ReportModels;
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
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            return View(group);
        }

        public async Task<IActionResult> WorkstationReport(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            ViewBag.Group = group;

            var worstations = await _reportService.WorkStations(group);

            return View(worstations);
        }

        public async Task<IActionResult> EquipmentReport(int id, bool hideInactive = true)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var model = new EquipmentReportViewModel
            {
                HideInactive = hideInactive,
                Group = group,
                EquipmentList = await _reportService.EquipmentList(group, hideInactive)
            };

            return View(model);
        }

        public async Task<IActionResult> KeyReport(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            ViewBag.Group = group;

            var worstations = await _reportService.WorkStations(group);

            return View(worstations);
        }

        public async Task<IActionResult> IncompleteDocumentsReport(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var model = new DocumentReportGroupViewModel
            {
                Group = group,
                IncompleteDocuments = await _reportService.IncompleteDocuments(group)
            };

            return View(model);
        }

        private async Task<Group> GetGroup(int id) {
            return await _context.Groups.SingleOrDefaultAsync(a =>
                a.Id == id && a.GroupPermissions.Any(w => w.UserId == User.Identity.Name));
        }
    }
}
