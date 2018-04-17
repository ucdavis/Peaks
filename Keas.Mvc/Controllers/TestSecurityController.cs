using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    public class TestSecurityController : SuperController
    {
        private readonly ISecurityService _securityService;
        private readonly ApplicationDbContext _context;

        public TestSecurityController(ISecurityService securityService, ApplicationDbContext context)
        {
            _securityService = securityService;
            _context = context;
        }
        public IActionResult Index()
        {
            var roles = _context.Roles
                .Where(r => r.Name == Role.Codes.KeyMaster || r.Name == Role.Codes.DepartmentalAdmin).ToList();
            ViewBag.Keymaster = _securityService.IsInRoles(_context, roles, Team).Result;
                //_securityService.IsInRole(_context, Role.Codes.KeyMaster, Team).Result ;
            return View();
        }
    }
}