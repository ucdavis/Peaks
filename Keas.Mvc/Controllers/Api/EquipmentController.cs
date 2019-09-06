using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
    public class EquipmentController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly IBigfixService _bigfixService;

        public EquipmentController(ApplicationDbContext context, IEventService eventService, IBigfixService bigfixService)
        {
            this._context = context;
            _eventService = eventService;
            this._bigfixService = bigfixService;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var equipment = 
                from eq in _context.Equipment
                .Where(x => x.Team.Slug == Team && x.Active &&
                (x.Name.StartsWith(q,comparison) || x.SerialNumber.StartsWith(q,comparison)))
                .Include(x => x.Attributes)
                .Include(x => x.Space).Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking()
                select new 
                {
                    equipment = eq,
                    label = eq.Id + ". " + eq.Name + " " + eq.SerialNumber,
                };

            return Json(await equipment.ToListAsync());
        }
        public async Task<IActionResult> GetEquipmentInSpace(int spaceId)
        {
            var equipment = await _context.Equipment
                .Where(x => x.Space.Id == spaceId && x.Team.Slug == Team && x.Active)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .AsNoTracking()
                .ToListAsync();
            return Json(equipment);
        }

        public async Task<IActionResult> CommonAttributeKeys() 
        {
            var keys = await _context.EquipmentAttributeKeys
                .Where(a => a.TeamId == null || a.Team.Slug == Team)
                .OrderBy(a => a.Key)
                .Select(a => a.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }
        
        public ActionResult ListEquipmentTypes() => Json(EquipmentTypes.Types);

        public async Task<IActionResult> ListAssigned(int personId)
        {
            var equipmentAssignments = await _context.Equipment
                .Where(x => x.Assignment.PersonId == personId && x.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
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
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x=>x.Person)
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

                UpdateTypeSpecificFields(equipment);

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
                var equipment = await _context.Equipment.Where(x => x.Team.Slug == Team && x.Active)
                    .Include(x => x.Space).Include(x => x.Assignment).ThenInclude(a => a.Person).SingleAsync(x => x.Id == equipmentId);
                
                if(equipment.Assignment != null)
                {
                    _context.EquipmentAssignments.Update(equipment.Assignment);
                    equipment.Assignment.ExpiresAt = DateTime.Parse(date);
                    equipment.Assignment.RequestedById =  User.Identity.Name;
                    equipment.Assignment.RequestedByName = User.GetNameClaim();
                    await _eventService.TrackEquipmentAssignmentUpdated(equipment); 
                }
                else
                {
                    equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                    equipment.Assignment.Person = await _context.People.SingleAsync(p => p.Id == personId);
                    equipment.Assignment.RequestedById = User.Identity.Name;
                    equipment.Assignment.RequestedByName = User.GetNameClaim();

                    _context.EquipmentAssignments.Add(equipment.Assignment);
                    await _eventService.TrackAssignEquipment(equipment);
                }                
                await _context.SaveChangesAsync();
                return Json(equipment);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Update([FromBody]Equipment updatedEquipment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var eq = await _context.Equipment.Where(x => x.Team.Slug == Team)
                    .Include(x => x.Space).Include(x => x.Attributes)
                    .SingleAsync(x => x.Id == updatedEquipment.Id);

                UpdateTypeSpecificFields(updatedEquipment);


                eq.Make = updatedEquipment.Make;
                eq.Model = updatedEquipment.Model;
                eq.Name = updatedEquipment.Name;
                eq.SerialNumber = updatedEquipment.SerialNumber;
                eq.Tags = updatedEquipment.Tags;
                eq.Notes = updatedEquipment.Notes;
                eq.Type = updatedEquipment.Type;
                eq.ProtectionLevel = updatedEquipment.ProtectionLevel;
                eq.AvailabilityLevel = updatedEquipment.AvailabilityLevel;
                eq.SystemManagementId = updatedEquipment.SystemManagementId;



                eq.Attributes.Clear();
                updatedEquipment.Attributes.ForEach(x => eq.AddAttribute(x.Key, x.Value));

                if(updatedEquipment.Space == null)
                {
                    eq.Space = null;
                }
                else
                {
                    eq.Space = await _context.Spaces.SingleAsync(x => x.Id == updatedEquipment.Space.Id);
                }                
                await _eventService.TrackUpdateEquipment(eq);
                await _context.SaveChangesAsync();
                return Json(eq);
            }
            return BadRequest(ModelState);
        }

        private static void UpdateTypeSpecificFields(Equipment updatedEquipment)
        {
            if (!EquipmentTypes.Is3Types.Contains(updatedEquipment.Type, StringComparer.OrdinalIgnoreCase))
            {
                updatedEquipment.ProtectionLevel = null;
                updatedEquipment.AvailabilityLevel = null;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(updatedEquipment.ProtectionLevel))
                {
                    updatedEquipment.ProtectionLevel = "P1";
                }

                if (string.IsNullOrWhiteSpace(updatedEquipment.AvailabilityLevel))
                {
                    updatedEquipment.AvailabilityLevel = "A1";
                }
            }

            if (!EquipmentTypes.BigfixTypes.Contains(updatedEquipment.Type, StringComparer.OrdinalIgnoreCase))
            {
                updatedEquipment.SystemManagementId = null;
            }
        }

        public async Task<IActionResult> Revoke([FromBody]Equipment equipment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var eq = await _context.Equipment.Where(x => x.Team.Slug == Team)
                    .Include(x => x.Assignment).ThenInclude(x => x.Person)
                    .SingleAsync(x => x.Id == equipment.Id);

                _context.EquipmentAssignments.Remove(eq.Assignment);
                eq.Assignment = null;               
                await _eventService.TrackUnAssignEquipment(equipment); 
                await _context.SaveChangesAsync();
                return Json(null);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Delete([FromBody]Equipment equipment)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if(!equipment.Active) 
            {
                return BadRequest(ModelState);
            }

            using(var transaction = _context.Database.BeginTransaction())
            {

                _context.Equipment.Update(equipment);

                if(equipment.Assignment != null)
                {
                    await _eventService.TrackUnAssignEquipment(equipment); // call before we remove person info
                    _context.EquipmentAssignments.Remove(equipment.Assignment);
                    equipment.Assignment = null;
                }

                equipment.Active = false;                
                await _eventService.TrackEquipmentDeleted(equipment);
                await _context.SaveChangesAsync();
                transaction.Commit();
                return Json(null);
            }

        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "Equipment" && x.Equipment.Team.Slug == Team && x.EquipmentId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }

        public async Task<BigFixComputerProperties> GetComputer(string id) {
            return await this._bigfixService.GetComputer(id);
        }

         public async Task<BigfixComputerSearchResult[]> GetComputersBySearch(string field, string value)
        {
            if (string.Equals(field, "Name", StringComparison.OrdinalIgnoreCase))
            {
                return await this._bigfixService.GetComputersByName(value);
        
                // call new bigfix name query function
            } else
            {
                // not supported yet
                return null;
            }
        }
    }
}
