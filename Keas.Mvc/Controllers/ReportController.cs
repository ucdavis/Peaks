using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Domain;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = "AnyRole")]
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

        public async Task<ActionResult> ExpiringItems (bool showInactive = false, DateTime? expiresBefore = null, string showType = "All")
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "KeyMasterAccess")]
        public async Task<ActionResult> ExpiringKeys (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Key";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "EquipMasterAccess")]
        public async Task<ActionResult> ExpiringEquipment (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Equipment";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "AccessMasterAccess")]
        public async Task<ActionResult> ExpiringAccess (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Access";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "SpaceMasterAccess")]
        public async Task<ActionResult> ExpiringWorkstations (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Workstation";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        public async Task<ActionResult> SupervisorDirectReports (int personID = 0)
        {
            var model = await SupervisorReportViewModel.Create(_context, Team, personID);

            return View(model);

        }

        public async Task<IActionResult> PersonTeamList(int personId)
        {
            var person = await _context.People.Include(a => a.User).Include(a => a.Team).SingleAsync(a => a.Id == personId);
            var teams = await _context.People.Where(a => a.UserId == person.UserId).Select(a => a.Team).Include(a => a.TeamPermissions).ThenInclude(a => a.User).ToListAsync();

            ViewBag.PersonName = $"{person.Name} ({person.Email})";

            return View(teams);
        }

         [Authorize(Policy = "DepartmentAdminAccess")]
         public async Task<IActionResult> TeamFeed(Guid id)
        {
            var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active && x.Team.ApiCode == id)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags})
                .ToListAsync();
           
            return Json(people);
        }   

         [Authorize(Policy = "DepartmentAdminAccess")]
         public async Task<IActionResult> TeamFeedWithSpace(Guid id)
        {
            var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active && x.Team.ApiCode == id)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags,
                workstation = (from w in _context.Workstations where w.Assignment.PersonId == p.Id select w)
                    .Include(w => w.Space)
                    .Select(w => new {w.Name, w.Space.BldgName, w.Space.RoomNumber})
                })
                .ToListAsync();
           
            return Json(people);
        }      
    }
}
