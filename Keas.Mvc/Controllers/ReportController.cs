using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Models;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.AnyRole)]
    public class ReportController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public ActionResult Index () {
            return View();
        }
        [Authorize(Policy = AccessCodes.Codes.DepartmentAdminAccess)]
        public async Task<ActionResult> ExpiringItems (bool showInactive = false, DateTime? expiresBefore = null, string showType = "All")
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ReportItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
        public async Task<ActionResult> ExpiringKeys (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Key";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ReportItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
        public async Task<ActionResult> ExpiringEquipment (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Equipment";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ReportItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.AccessMasterAccess)]
        public async Task<ActionResult> ExpiringAccess (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Access";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ReportItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.SpaceMasterAccess)]
        public async Task<ActionResult> ExpiringWorkstations (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Workstation";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ReportItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        public async Task<ActionResult> SupervisorDirectReports (int personID = 0)
        {
            var model = await SupervisorReportViewModel.Create(_context, Team, personID);

            return View(model);

        }

        [Authorize(Policy = AccessCodes.Codes.DepartmentAdminAccess)]
        public async Task<IActionResult> PersonTeamList(int personId)
        {
            var person = await _context.People.Include(a => a.User).Include(a => a.Team).SingleAsync(a => a.Id == personId);
            var teams = await _context.People.Where(a => a.UserId == person.UserId).Select(a => a.Team).Include(a => a.TeamPermissions).ThenInclude(a => a.User).ToListAsync();

            ViewBag.PersonName = $"{person.Name} ({person.Email})";

            return View(teams);
        }
    }
}
