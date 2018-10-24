using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Keas.Core.Data;
using Keas.Mvc.Services;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class HomeController : SuperController
    {
        private readonly ApplicationDbContext _context;

        private readonly ISecurityService _securityService;


        public HomeController(ApplicationDbContext context, ISecurityService securityService)
        {
            _context = context;
            _securityService = securityService;
        }


        public async Task<ActionResult> Index()
        {
            if (Team == null)
            {
                return RedirectToAction("SelectTeam", "Confirm", new { urlRedirect = "home/index" });
            }
                      
            if (!await _securityService.IsInTeamOrAdmin(Team))
            {
                Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess", "Home");
            }
            var person = await _securityService.GetPerson(Team);  
            var viewmodel = await HomeViewModel.Create(_context, person);
            return View(viewmodel);
        }

        public IActionResult NoAccess()
        {
            // TODO Fix the instructions
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult React()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
