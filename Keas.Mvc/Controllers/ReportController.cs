using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Keas.Mvc.Services;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.AnyRole)]
    public class ReportController : SuperController
    {
        private readonly ApplicationDbContext _context;

        private readonly ISecurityService _securityService;
        private readonly IReportService _reportService;

        public ReportController(ApplicationDbContext context, ISecurityService securityService, IReportService reportService)
        {
            _context = context;
            _securityService = securityService;
            _reportService = reportService;
        }

        public ActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> PersonActions(DateTime? startDate, DateTime? endDate)
        {
            var team = await _context.Teams.SingleAsync(a => a.Slug == Team);
            if (startDate.HasValue == false && endDate.HasValue == false)
            {
                startDate = DateTime.UtcNow.ToPacificTime().Date.AddMonths(-1);
            }

            var personNotifications = _context.PersonNotifications.Where(a => a.TeamId == team.Id);
            if (startDate.HasValue)
            {
                personNotifications = personNotifications.Where(a => a.ActionDate >= startDate.Value.Date.ToUniversalTime());
            }

            if (endDate.HasValue)
            {
                personNotifications = personNotifications.Where(a => a.ActionDate <= endDate.Value.Date.AddDays(1).ToUniversalTime()); //Date 12AM + 1 day
            }

            var model = new ReportPersonNotifyViewModel
            {
                StartDate = startDate,
                EndDate = endDate,
                PersonNotifications = await personNotifications.ToListAsync()
            };

            return View(model);
        }

        public async Task<ActionResult> ExpiringItems(DateTime? expiresBefore = null, string showType = "All")
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var userRoles = await _securityService.GetUserRolesInTeamOrAdmin(Team);
            var model = await ReportItemsViewModel.CreateExpiry(_context, expiresBefore.Value, Team, showType, userRoles, _securityService);
            return View(model);
        }


        public async Task<ActionResult> SupervisorDirectReports(int personID = 0)
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
        
        [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
        public async Task<IActionResult> UnAcceptedItems(string showType = "All")
        {
            var userRoles = await _securityService.GetUserRolesInTeamOrAdmin(Team);
            var model = await ReportItemsViewModel.CreateUnaccepted(_context, Team, showType, userRoles, _securityService);
            return View(model);

        }

        public async Task<IActionResult> KeyValues()
        {
            var model = await KeyValueReportViewModel.Create(_context, Team);
            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.SpaceMasterAccess)]
        public async Task<IActionResult> WorkstationReport()
        {
            var worstations = await _reportService.WorkStations(null, Team);

            return View(worstations);
        }
    }
}
