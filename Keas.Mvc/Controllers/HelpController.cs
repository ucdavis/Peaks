using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
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
            var person = await _securityService.GetPerson(Team);
            if(person == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }

            var team = await _context.Teams.Where(a => a.Slug == Team).Include(a => a.TeamPermissions).ThenInclude(a => a.User).Include(a => a.TeamPermissions).ThenInclude(a => a.Role).SingleAsync();

            return View(team);
        }
    }
}
