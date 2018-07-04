using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> Index()
        {
            return View();
        }

        [Authorize(Policy = "EquipMasterAccess")]
        public IActionResult Equip()
        {
            return View("Index");
        }

        [Authorize(Policy = "KeyMasterAccess")]
        public IActionResult Key()
        {
            return View("Index");
        }

        [Authorize(Policy = "AccessMasterAccess")]
        public IActionResult Access()
        {
            return View("Index");
        }

        [Authorize(Policy = "DepartmentAdminAccess")]
        public IActionResult DeptAdmin()
        {
            return View("Index");
        }
    }
}