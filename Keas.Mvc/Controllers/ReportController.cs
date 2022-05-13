using Keas.Core.Data;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Models.ReportModels;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Models;

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

        public async Task<ActionResult> Index()
        {
            var model = await _context.TeamPermissions.Where(a => a.Team.Slug == Team && a.UserId == User.Identity.Name).Select(a => a.Role.Name).ToArrayAsync();
            return View(model);
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
                personNotifications = personNotifications.Where(a => a.ActionDate >= startDate.Value.Date.ToUniversalTime()); // lgtm [cs/dereferenced-value-may-be-null]
            }

            if (endDate.HasValue)
            {
                personNotifications = personNotifications.Where(a => a.ActionDate <= endDate.Value.Date.AddDays(1).ToUniversalTime()); //Date 12AM + 1 day  // lgtm [cs/dereferenced-value-may-be-null]
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
            var model = await _reportService.ExpiringItems(null, Team, expiresBefore, showType);
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
            var teams = await _context.Teams.Where(t => t.People.Any(p => p.UserId == person.UserId)).Include(a => a.TeamPermissions).ThenInclude(a => a.User).ToListAsync();
            ViewBag.PersonName = $"{person.Name} ({person.Email})";

            return View(teams);
        }
        
       
        public async Task<IActionResult> UnAcceptedItems(string showType = "All")
        {
            var userRoles = await _securityService.GetUserRoleNamesInTeamOrAdmin(Team);
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

        [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
        public async Task<IActionResult> EquipmentReport(bool hideInactive = true)
        {
            var model = new EquipmentReportViewModel
            {
                HideInactive = hideInactive,
                EquipmentList = await _reportService.EquipmentList(null, Team, hideInactive)
            };

            return View(model);
        }
        [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
        public async Task<IActionResult> EquipmentReportV2(bool hideInactive = true)
        {
            var model = new EquipmentReportViewModel
            {
                HideInactive = hideInactive,
                EquipmentList = await _reportService.EquipmentList(null, Team, hideInactive)
            };

            return View(model);
        }

        [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
        public async Task<IActionResult> EquipmentHistoryReport(int id)
        {
            return View(await _reportService.EquipmentHistory(null, Team, id)) ;
        }

        public async Task<IActionResult> PersonEquipmentHistoryReport(int id)
        {
            return View(await _reportService.PersonEquipmentHistory(null, Team, id));
        }

        public async Task<IActionResult> AccessReport()
        {
            var accessList = await _reportService.AccessList(null, Team);

            return View(accessList);
        }

        [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
        public async Task<IActionResult> KeyReport()
        {
            var keys = await _reportService.Keys(null, Team, includeSerials: false, includeSpaces: false);

            return View(keys);
        }

        [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
        public async Task<IActionResult> KeyWithSerialReport()
        {
            var keys = await _reportService.Keys(null, Team, includeSerials: true, includeSpaces: false);

            return View(keys);
        }
        [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
        public async Task<IActionResult> KeyWithSpaceReport()
        {
            var keys = await _reportService.Keys(null, Team, includeSerials: false, includeSpaces: true);

            return View(keys);
        }

        [Authorize(Policy = AccessCodes.Codes.DocumentMasterAccess)]
        public async Task<IActionResult> PeopleWithIncompleteDocuments()
        {
            var incompleteDocs = await _reportService.IncompleteDocuments(null, Team);

            return View(incompleteDocs);
        }

        public async Task<IActionResult> PeopleInTeam(bool hideInactive = true)
        {
            var team = await _context.Teams.SingleAsync(a => a.Slug == Team);
            var peopleQuery = _context.People.IgnoreQueryFilters().Include(a => a.User).Include(a => a.Supervisor).Where(a => a.TeamId == team.Id).AsNoTracking().AsQueryable();
            if (hideInactive)
            {
                peopleQuery = peopleQuery.Where(a => a.Active);
            }

            var model = new PeopleInTeamReportViewModel
            {
                HideInactive = hideInactive,
                PeopleList = await peopleQuery.ToListAsync()
            };

            return View(model);
        }

        public async Task<IActionResult> PeopleLeavingWithAssets()
        {
            var theDate = DateTime.UtcNow.AddDays(30).Date;

            var peopleQuery = await _reportService.PeopleLeavingWithAssets(null, Team, theDate);

            return View(peopleQuery);
        }
    }
}
