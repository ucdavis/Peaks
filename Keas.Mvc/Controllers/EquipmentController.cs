using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = "EquipMasterAccess")]
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

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var equipment = await _context.Equipment
                .Where(x => x.Team.Name == Team && x.Active && x.Assignment == null &&
                (x.Name.StartsWith(q,comparison) || x.SerialNumber.StartsWith(q,comparison)))
                .Include(x => x.Room)
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }

        public async Task<IActionResult> GetEquipmentInSpace(string roomKey)
        {
            var equipment = await _context.Equipment.Where(x => x.Space.RoomKey == roomKey).AsNoTracking().ToListAsync();
            return Json(equipment);
        }

        public async Task<IActionResult> CommonAttributeKeys() 
        {
            var keys = await _context.EquipmentAttributes
            .Where(x => x.Equipment.Team.Name == Team)
            .GroupBy(x => x.Key)
            .Take(5)
            .OrderByDescending(x => x.Count())
            .Select(x => x.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        public async Task<IActionResult> ListAssigned(int personId)
        {
            var equipmentAssignments = await _context.Equipment
                .Where(x => x.Assignment.PersonId == personId && x.Team.Name == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person.User)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(equipmentAssignments);
        }

        // List all equipments for a team
        public async Task<IActionResult> List()
        {
            var equipments = await _context.Equipment
                .Where(x => x.Team.Name == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x=>x.Person.User)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(equipments);
        }

        public async Task<IActionResult> Create([FromBody]Equipment equipment)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                if (equipment.Space != null)
                {
                   var space = await _context.Spaces.SingleAsync(x => x.RoomKey == equipment.Space.RoomKey);
                    equipment.Space = space;
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
                var equipment = await _context.Equipment.Where(x => x.Team.Name == Team).Include(x => x.Space).SingleAsync(x => x.Id == equipmentId);
                equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                equipment.Assignment.Person = await _context.People.Include(p => p.User).SingleAsync(p => p.Id == personId);

                _context.EquipmentAssignments.Add(equipment.Assignment);

                await _context.SaveChangesAsync();
                await _eventService.TrackAssignEquipment(equipment);
                return Json(equipment);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Update([FromBody]Equipment equipment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var eq = await _context.Equipment.Where(x => x.Team.Name == Team)
                    .Include(x => x.Room).Include(x => x.Attributes)
                    .SingleAsync(x => x.Id == equipment.Id);
                    
                eq.Make = equipment.Make;
                eq.Model = equipment.Model;
                eq.Name = equipment.Name;
                eq.SerialNumber = equipment.SerialNumber;
                
                eq.Attributes.Clear();
                equipment.Attributes.ForEach(x => eq.AddAttribute(x.Key, x.Value));

                if(eq.Room.RoomKey != equipment.Room.RoomKey)
                {
                    eq.Room = await _context.Rooms.SingleAsync(x => x.RoomKey == equipment.Room.RoomKey);
                }

                await _context.SaveChangesAsync();
                await _eventService.TrackUpdateEquipment(eq);
                return Json(eq);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke([FromBody]Equipment equipment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var eq = await _context.Equipment.Where(x => x.Team.Name == Team)
                    .Include(x => x.Assignment).ThenInclude(x => x.Person.User)
                    .SingleAsync(x => x.Id == equipment.Id);

                _context.EquipmentAssignments.Remove(eq.Assignment);
                eq.Assignment = null;
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignEquipment(equipment);
                return Json(null);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "Equipment" && x.Equipment.Team.Name == Team && x.EquipmentId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}