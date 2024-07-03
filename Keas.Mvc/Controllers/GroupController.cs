using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models.GroupModels;
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
            
            var allTeamPermissions = await _context.TeamPermissions.Include(a => a.Team).Include(a => a.Role).Include(a => a.User).Where(a => a.Role != null && a.Role.Name == "DepartmentalAdmin").ToListAsync();

            var model = new GroupIndexViewModel {Group = group};
            model.TeamContact = new List<GroupTeamContactInfo>();

            var teamIds = group.Teams.Select(a => a.TeamId).ToArray();
            foreach (var teamPermission in allTeamPermissions)
            {
                if (model.TeamContact.Any(a => a.TeamSlug == teamPermission.Team.Slug))
                {
                    continue;
                }
                var gtci = new GroupTeamContactInfo();
                gtci.TeamName = teamPermission.Team.Name;
                gtci.TeamSlug = teamPermission.Team.Slug;
                var firstTeamPermission = allTeamPermissions.FirstOrDefault(a => a.TeamId == teamPermission.TeamId);
                if (firstTeamPermission != null)
                {
                    gtci.FirstDeptAdmin = $"{firstTeamPermission.User.FirstName} {firstTeamPermission.User.LastName} - ({firstTeamPermission.User.Id}) - {firstTeamPermission.User.Email}";
                }

                gtci.AllDeptAdmins = string.Join("; ", allTeamPermissions.Where(a => a.TeamId == teamPermission.TeamId).Select(a => $"{a.User.FirstName} {a.User.LastName}<{a.User.Email}>"));
                gtci.InGroup = teamIds.Contains(teamPermission.TeamId);

                model.TeamContact.Add(gtci);
            }

            return View(model);
        }

        public async Task<IActionResult> WorkstationReport(int id, bool hideInactive = true)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var model = new WorkstationReportViewModel
            {
                HideInactive = hideInactive,
                Group = group,
                WorkstationList = await _reportService.WorkStations(group, hideInactive)
            };

            return View(model);
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

        public async Task<IActionResult> KeySerialsWithSpacesReport(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            ViewBag.Group = group;

            var model = await _reportService.Keys(group);

            return View(model);
        }

        public async Task<IActionResult> KeySerialsReport(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            ViewBag.Group = group;

            var model = await _reportService.Keys(group, includeSpaces: false);

            return View(model);
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

        public async Task<IActionResult> CompletedDocumentsReport(int id, DateTime? start = null, DateTime? end = null)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var model =  await _reportService.CompletedDocuments(group, start, end);
            return View(model);
        }

        public async Task<IActionResult> PeopleLeavingWithAssets(int id)
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var theDate = DateTime.UtcNow.AddDays(30).Date;
            var model = new PeopleLeavingGroupViewModel
            {
                Group = group,
                People = await _reportService.PeopleLeavingWithAssets(group, theDate),
            };


            return View(model);
        }

        public async Task<ActionResult> ExpiringItems(int id, DateTime? expiresBefore = null, string showType = "All")
        {
            var group = await GetGroup(id);

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            var model = await _reportService.ExpiringItems(group, expiresBefore, showType);
            return View(model);
        }

        private async Task<Group> GetGroup(int id) {
            return await _context.Groups.Include(a => a.Teams).ThenInclude(a => a.Team).SingleOrDefaultAsync(a =>
                a.Id == id && a.GroupPermissions.Any(w => w.UserId == User.Identity.Name));
        }
    }
}
