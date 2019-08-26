using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.DepartmentAdminAccess)] //TODO: Decide if we want equip manager to have access
    public class EquipmentAttributeKeyController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public EquipmentAttributeKeyController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult> Index()
        {
            var model = await _context.EquipmentAttributeKeys.Where(a => a.TeamId == null || a.Team.Slug == Team).ToListAsync();
            return View(model);
        }

        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> Create(EquipmentAttributeKey model)
        {
            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);

            if (ModelState.IsValid)
            {
                if (await _context.EquipmentAttributeKeys.AnyAsync(a => a.TeamId == null && a.Key.Equals(model.Key.Trim(), StringComparison.OrdinalIgnoreCase)))
                {
                    ModelState.AddModelError("Key", "This Key already exists as a global key.");
                }
                else
                {
                    if (await _context.EquipmentAttributeKeys.AnyAsync(a => a.TeamId == team.Id && a.Key.Equals(model.Key.Trim(), StringComparison.OrdinalIgnoreCase)))
                    {
                        ModelState.AddModelError("Key", "This Key already exists.");
                    }
                }
            }

            if (ModelState.IsValid)
            {
                model.Team = team;
                model.Key = model.Key.Trim();
                _context.EquipmentAttributeKeys.Add(model);
                await _context.SaveChangesAsync();
                Message = "Equipment Attribute Key created.";
                return RedirectToAction(nameof(Index));
            }
            Message = "An error occurred. Equipment Attribute Key could not be created.";
            return View();
        }
    }
}
