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

        public ActionResult Index () {
            return View();
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

        [Authorize(Policy = "KeyMasterAccess")]
        public async Task<ActionResult> ExpiringKeys (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Key";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "EquipMasterAccess")]
        public async Task<ActionResult> ExpiringEquipment (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Equipment";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "AccessMasterAccess")]
        public async Task<ActionResult> ExpiringAccess (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Access";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }

        [Authorize(Policy = "SpaceMasterAccess")]
        public async Task<ActionResult> ExpiringWorkstations (bool showInactive = false, DateTime? expiresBefore = null)
        {
            string showType = "Workstation";
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }
            var model = await ExpiringItemsViewModel.Create(_context, expiresBefore.Value, Team, showInactive, showType);
            return View(model);
        }
    }
}