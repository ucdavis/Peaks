using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class EquipmentController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public EquipmentController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> Search(int teamId, string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var equipment = await _context.Equipment
                .Where(x => x.Team.Id == teamId && x.Active && x.Assignment == null &&
                (x.Name.StartsWith(q,comparison) || x.SerialNumber.StartsWith(q,comparison)))
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }

        public async Task<IActionResult> ListAssigned(int personId, int teamId)
        {
            var equipmentAssignments = await _context.Equipment.Where(x => x.Assignment.PersonId == personId && x.TeamId == teamId).Include(x => x.Assignment).AsNoTracking().ToArrayAsync();

            return Json(equipmentAssignments);
        }

        // List all equipments for a team
        public async Task<IActionResult> List(int id)
        {
            var equipments = await _context.Equipment.Where(x => x.TeamId == id).Include(x => x.Assignment).AsNoTracking().ToArrayAsync();

            return Json(equipments);
        }

        public async Task<IActionResult> ListUnassigned(int teamId)
        {
            var equipment = await _context.Equipment.Where(x => x.TeamId == teamId && x.EquipmentAssignmentId == null).Include(x => x.Assignment).AsNoTracking().ToArrayAsync();

            return Json(equipment);
        }

        public async Task<IActionResult> Create([FromBody]Equipment equipment)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                _context.Equipment.Add(equipment);
                await _context.SaveChangesAsync();
            }
            return Json(equipment);
        }

        public async Task<IActionResult> Assign(int equipmentId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure equipment exists, makes sure equipment is in this team
            if (ModelState.IsValid)
            {
                var equipment = await _context.Equipment.SingleAsync(x => x.Id == equipmentId);
                equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };

                _context.EquipmentAssignments.Add(equipment.Assignment);

                await _context.SaveChangesAsync();
                return Json(equipment);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke([FromBody]Equipment equipment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var eq = await _context.Equipment.Include(x => x.Assignment).SingleAsync(x => x.Id == equipment.Id);

                _context.EquipmentAssignments.Remove(eq.Assignment);
                eq.Assignment = null;
                eq.EquipmentAssignmentId = null;
                await _context.SaveChangesAsync();
                return Json(eq);
            }
            return BadRequest(ModelState);
        }
    }
}