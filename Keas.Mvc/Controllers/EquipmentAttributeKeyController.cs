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

        public async Task<IActionResult> Index()
        {
            var model = await _context.EquipmentAttributeKeys.Where(a => a.TeamId == null || a.Team.Slug == Team).ToListAsync();
            return View(model);
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(EquipmentAttributeKey model)
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
                if (team == null)
                {
                    throw new Exception("This should never happen.");
                }
                model.Team = team;
                model.Key = model.Key.Trim();
                model.Description = model.Description.Trim();
                _context.EquipmentAttributeKeys.Add(model);
                await _context.SaveChangesAsync();
                Message = "Equipment Attribute Key created.";
                return RedirectToAction(nameof(Index));
            }
            Message = "An error occurred. Equipment Attribute Key could not be created.";
            return View();
        }

        public async Task<IActionResult> Edit(int id)
        {
            var eka = await _context.EquipmentAttributeKeys.SingleAsync(a => a.TeamId != null && a.Team.Slug == Team && a.Id == id);
            if (eka == null)
            {
                return NotFound();
            }
            return View(eka);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, EquipmentAttributeKey model)
        {
            if (id != model.Id)
            {
                return NotFound();
            }

            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);
            var eka = await _context.EquipmentAttributeKeys.SingleAsync(a => a.TeamId != null && a.Team.Slug == Team && a.Id == id);

            if (ModelState.IsValid)
            {
                if (await _context.EquipmentAttributeKeys.AnyAsync(a => a.TeamId == null && a.Key.Equals(model.Key.Trim(), StringComparison.OrdinalIgnoreCase)))
                {
                    ModelState.AddModelError("Key", "This Key already exists as a global key.");
                }
                else
                {
                    if (await _context.EquipmentAttributeKeys.AnyAsync(a => a.TeamId == team.Id && a.Id != id && a.Key.Equals(model.Key.Trim(), StringComparison.OrdinalIgnoreCase)))
                    {
                        ModelState.AddModelError("Key", "This Key already exists.");
                    }
                }
            }

            if (ModelState.IsValid)
            {
                eka.Key = model.Key.Trim();
                eka.Description = model.Description.Trim();
                await _context.SaveChangesAsync();
                Message = "Equipment Attribute Key updated.";

                return RedirectToAction("Index");
            }
            else
            {
                ErrorMessage = "Equipment Attribute Key not updated.";
            }

            return View(model);
        }

        public async Task<IActionResult> Delete(int id)
        {
            var eka = await _context.EquipmentAttributeKeys.SingleAsync(a => a.TeamId != null && a.Team.Slug == Team && a.Id == id);
            if (eka == null)
            {
                return NotFound();
            }
            return View(eka);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id, EquipmentAttributeKey eakToDelete)
        {
            if (id != eakToDelete.Id)
            {
                return NotFound();
            }

            var eka = await _context.EquipmentAttributeKeys.SingleAsync(a => a.TeamId != null && a.Team.Slug == Team && a.Id == id);

            _context.Remove(eka);

            await _context.SaveChangesAsync();
            Message = "Equipment Attribute Key deleted.";
            return RedirectToAction("Index");
        }
    }
}
