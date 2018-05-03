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
    public class ConfirmController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;

        public ConfirmController(ApplicationDbContext context, ISecurityService _securityService)
        {
            _context = context;
            this._securityService = _securityService;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _securityService.GetUser();
            var keyPending = _context.Keys.Where(k=> !k.Assignment.IsConfirmed && k.Assignment.Person.User == user);
            var equipmentPending =
                _context.Equipment.Where(e => !e.Assignment.IsConfirmed && e.Assignment.Person.User == user);

            return View();
        }
    }
}