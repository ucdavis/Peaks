using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        public async Task<ActionResult> ExpiringItems (bool showInactive = false, DateTime? expiresBefore = null, string showType = "All")
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }
    }
}