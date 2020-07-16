using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class HelpController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;

        public HelpController(ApplicationDbContext context, ISecurityService securityService)
        {
            _context = context;
            _securityService = securityService;
        }


        public async Task<IActionResult> Index()
        {
            ViewBag.Version = GetVersion();

            var person = await _securityService.GetPerson(Team);
            if(person == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }

            var team = await _context.Teams.Where(a => a.Slug == Team).Include(a => a.TeamPermissions).ThenInclude(a => a.User).Include(a => a.TeamPermissions).ThenInclude(a => a.Role).SingleAsync();

            return View(team);
        }

        public async Task<IActionResult> MyContacts()
        {
            ViewBag.Version = GetVersion();

            var person = await _securityService.GetPerson(Team);
            if (person == null)
            {
                Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess", "Home");
            }

            var team = await _context.Teams.Where(a => a.Slug == Team).Include(a => a.TeamPermissions).ThenInclude(a => a.User).Include(a => a.TeamPermissions).ThenInclude(a => a.Role).SingleAsync();

            return View(team);
        }

        private string GetVersion()
        {
            return FileVersionInfo.GetVersionInfo(Assembly.GetExecutingAssembly().Location).FileVersion;
        }
    }
}
