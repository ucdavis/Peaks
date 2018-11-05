using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = "KeyMasterAccess")]
    public class KeySerialsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public KeySerialsController(ApplicationDbContext context, IEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        //Return Serials instead????
        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var keys = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team && x.Key.Active && x.Active && x.Assignment == null
                            && (x.Key.Name.StartsWith(q, comparison) || x.Number.StartsWith(q, comparison)))
                .Include(x => x.Key)
                .ThenInclude(key => key.KeyXSpaces)
                .ThenInclude(keyXSpaces => keyXSpaces.Space)
                .Select(x=> x.Key)
                .AsNoTracking().ToListAsync();
            return Json(keys);
        }

        public async Task<IActionResult> ListAssigned(int personId)
        {
            var keyAssignments = await _context.KeySerials
                .Where(x => x.Assignment.PersonId == personId && x.Key.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(assingment => assingment.Person.User)
                .Include(x => x.Key.Team)
                .AsNoTracking()
                .ToArrayAsync();
            return Json(keyAssignments);
        }

        // List all keys for a team
        public async Task<IActionResult> List()
        {
            var keys = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(assignment => assignment.Person.User)
                .Include(x => x.Key.Team)
                .AsNoTracking()
                .ToArrayAsync();

            return Json(keys);
        }

        // Now returns serial. Need to pass in serialID
        public async Task<IActionResult> Assign(int serialId, int personId, string date)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var serial = await _context.KeySerials.Where(x => x.Key.Team.Slug == Team && x.Active)
                .Include(x => x.Assignment).SingleAsync(x => x.Id == serialId);

            if(serial.Assignment != null)
            {
                _context.KeyAssignments.Update(serial.Assignment);
                serial.Assignment.ExpiresAt = DateTime.Parse(date);
                // TODO: track update assignment?
            }
            else 
            {
                serial.Assignment = new KeyAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                serial.Assignment.Person = await _context.People.Include(p=> p.User).SingleAsync(p=> p.Id==personId);

                _context.KeyAssignments.Add(serial.Assignment);
                await _eventService.TrackAssignKey(serial);
            }

            await _context.SaveChangesAsync();
            return Json(serial);
        }

        public async Task<IActionResult> Update([FromBody]Key key)
        {
            //TODO: check permissions, make sure SN isn't edited 
            if (ModelState.IsValid)
            {
                var k = await _context.Keys.Where(x => x.Team.Slug == Team)
                    .Include(x=> x.Serials)
                    .ThenInclude(serials=> serials.Assignment)
                    .ThenInclude(x => x.Person.User)
                    .Include(x=> x.Team)
                    .SingleAsync(x => x.Id == key.Id);
                k.Name = key.Name;
                // TODO: Should this also be updating serials? KeyXSpaces?
                await _context.SaveChangesAsync();
                await _eventService.TrackUpdateKey(key);
                return Json(k);
            }
            return BadRequest(ModelState);
        }

        // Need to pass in serial, not key. Returns Serial now.
        public async Task<IActionResult> Revoke([FromBody]KeySerial keySerial)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var s = await _context.KeySerials.Where(x => x.Key.Team.Slug == Team).Include(x => x.Assignment)
                    .ThenInclude(x => x.Person.User)
                    .SingleAsync(x => x.Id == keySerial.Id);
                
                _context.KeyAssignments.Remove(s.Assignment);
                s.Assignment = null;
                s.KeyAssignmentId = null;
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignKey(keySerial);
                return Json(s);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "Key" && x.Equipment.Team.Slug == Team && x.EquipmentId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}