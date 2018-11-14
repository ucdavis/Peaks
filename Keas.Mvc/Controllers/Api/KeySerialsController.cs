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
            // break out the query into terms
            var terms = q.Split(' ');

            var comparison = StringComparison.InvariantCultureIgnoreCase;

            var query = _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team && x.Key.Active && x.Active && x.KeySerialAssignment == null);

            foreach (var term in terms)
            {
                query = query.Where(x => x.Key.Name.StartsWith(term, comparison)
                                        || x.Key.Code.StartsWith(term, comparison)
                                        || x.Number.StartsWith(term, comparison));
            }

            var keySerials = await query
                .Include(x => x.Key)
                .AsNoTracking()
                .ToListAsync();

            return Json(keySerials);
        }

        // list all serials for a key
        public async Task<IActionResult> GetForKey(int keyid)
        {
            var keys = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team && x.Key.Active)
                .Where(x => x.KeyId == keyid)
                .Include(x => x.Key)
                .Include(s => s.KeySerialAssignment)
                    .ThenInclude(assignment => assignment.Person.User)
                .AsNoTracking()
                .ToListAsync();

            return Json(keys);
        }

        // get all the key serials attached to a person
        public async Task<IActionResult> GetForPerson(int personId)
        {
            var keySerials = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team)
                .Where(x => x.KeySerialAssignment.PersonId == personId)
                .Include(x => x.Key)
                .Include(x => x.KeySerialAssignment)
                    .ThenInclude(assingment => assingment.Person.User)
                .AsNoTracking()
                .ToArrayAsync();

            return Json(keySerials);
        }

        public async Task<IActionResult> Create([FromBody] KeySerial keySerial)
        {
            // TODO Make sure user has permissions
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            // get key
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team && x.Active)
                .Include(k => k.Serials)
                .SingleOrDefaultAsync(k => k.Id == keySerial.Key.Id);

            if (key == null)
            {
                return BadRequest();
            }

            // check for duplicate serial
            if (key.Serials.Any(s => s.Number == keySerial.Number))
            {
                return BadRequest();
            }

            // add key serial
            key.Serials.Add(keySerial);
            await _context.SaveChangesAsync();

            //await _eventService.TrackCreateKeySerial(key);

            return Json(keySerial);
        }

        // Now returns serial. Need to pass in serialID
        public async Task<IActionResult> Assign(int serialId, int personId, string date)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // find serial
            var serial = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team && x.Active)
                .Include(x => x.KeySerialAssignment)
                .Include(x => x.Key)
                .SingleAsync(x => x.Id == serialId);

            // check for existing assignment
            if (serial.KeySerialAssignment != null)
            {
                // TODO: not sure what's going on here
                _context.KeySerialAssignments.Update(serial.KeySerialAssignment);
                serial.KeySerialAssignment.ExpiresAt = DateTime.Parse(date);
                // TODO: track update assignment?
            }
            else 
            {
                serial.KeySerialAssignment = new KeySerialAssignment
                {
                    PersonId = personId,
                    ExpiresAt = DateTime.Parse(date)
                };

                serial.KeySerialAssignment.Person = await _context.People
                    .Include(p => p.User)
                    .SingleAsync(p => p.Id == personId);

                _context.KeySerialAssignments.Add(serial.KeySerialAssignment);
                await _eventService.TrackAssignKeySerial(serial);
            }

            await _context.SaveChangesAsync();
            return Json(serial);
        }

        // Need to pass in serial, not key. Returns Serial now.
        public async Task<IActionResult> Revoke(int serialId)
        {
            //TODO: check permissions
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var keySerial = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team)
                .Include(x => x.Assignment)
                .SingleAsync(x => x.Id == serialId);
                
            _context.KeySerialAssignments.Remove(keySerial.Assignment);
            keySerial.Assignment = null;
            keySerial.KeySerialAssignmentId = null;

            await _context.SaveChangesAsync();
            await _eventService.TrackUnAssignKeySerial(keySerial);

            return Json(keySerial);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "KeySerial"
                        && x.KeySerial.Key.Team.Slug == Team
                        && x.KeySerial.Id == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking()
                .ToListAsync();

            return Json(history);
        }
    }
}