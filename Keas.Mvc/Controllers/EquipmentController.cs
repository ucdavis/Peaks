using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace Keas.Mvc.Controllers
{
    public class EquipmentController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public EquipmentController(ApplicationDbContext context, IEventService eventService)
        {
            this._context = context;
            _eventService = eventService;
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

        public async Task<IActionResult> GetEquipmentInRoom(string roomKey)
        {
            var equipment = await _context.Equipment.Where(x => x.Room.RoomKey == roomKey).AsNoTracking().ToListAsync();
            return Json(equipment);
        }

        public async Task<IActionResult> CommonAttributeKeys(int teamId) 
        {
            var keys = await _context.EquipmentAttributes
            //.Where(x => x.Equipment.TeamId == teamId)
            .GroupBy(x => x.Key)
            // .Where(x => x.Count() > 1)
            .Take(5)
            .OrderByDescending(x => x.Count())
            .Select(x => x.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        public async Task<IActionResult> ListAssigned(int personId, int teamId)
        {
            var equipmentAssignments = await _context.Equipment
                .Where(x => x.Assignment.PersonId == personId && x.TeamId == teamId)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person.User)
                .Include(x => x.Room)
                .Include(x => x.Attributes)
                .AsNoTracking().ToArrayAsync();

            return Json(equipmentAssignments);
        }

        // List all equipments for a team
        public async Task<IActionResult> List(int id)
        {
            var equipments = await _context.Equipment
                .Where(x => x.TeamId == id)
                .Include(x => x.Assignment)
                .ThenInclude(x=>x.Person.User)
                .Include(x => x.Room)
                .Include(x => x.Attributes)
                .AsNoTracking().ToArrayAsync();

            return Json(equipments);
        }

        public async Task<IActionResult> Create([FromBody]Equipment equipment)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                if (equipment.Room != null)
                {
                   var room = await _context.Rooms.SingleAsync(x => x.RoomKey == equipment.Room.RoomKey);
                    equipment.Room = room;
                }
                _context.Equipment.Add(equipment);
                await _eventService.TrackCreateEquipment(equipment);
                await _context.SaveChangesAsync();
            }
            return Json(equipment);
        }

        public async Task<IActionResult> Assign(int equipmentId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure equipment exists, makes sure equipment is in this team
            if (ModelState.IsValid)
            {
                var equipment = await _context.Equipment.Include(x => x.Room).SingleAsync(x => x.Id == equipmentId);
                equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                equipment.Assignment.Person = await _context.People.Include(p => p.User).SingleAsync(p => p.Id == personId);

                _context.EquipmentAssignments.Add(equipment.Assignment);

                await _context.SaveChangesAsync();
                await _eventService.TrackAssignEquipment(equipment);
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
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignEquipment(equipment);
                return Json(null);
            }
            return BadRequest(ModelState);
        }
    }
}