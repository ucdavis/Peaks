using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    public class ReportController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public async Task<ActionResult> ExpiringItems (bool showInactive = false, DateTime? expiresBefore = null)
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive);
            return View(model);
        }
    }
}