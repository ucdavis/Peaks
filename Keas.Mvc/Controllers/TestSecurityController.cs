using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
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
            ViewBag.Keymaster = _securityService.HasKeyMasterAccess(_context, Team).Result ;
            return View();
        }
    }
}