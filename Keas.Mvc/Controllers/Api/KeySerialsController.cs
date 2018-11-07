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

        // list all serials for a key
        public async Task<IActionResult> GetForKey(int keyid)
        {
            var keys = await _context.KeySerials
                .Where(x => x.Key.Team.Slug == Team && x.Key.Active)
                .Where(x => x.KeyId == keyid)
                .Include(x => x.Key)
                .Include(s => s.Assignment)
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
                .Where(x => x.Assignment.PersonId == personId)
                .Include(x => x.Key)
                .Include(x => x.Assignment)
                    .ThenInclude(assingment => assingment.Person.User)
                .AsNoTracking()
                .ToArrayAsync();

            return Json(keySerials);
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
                .Include(x => x.Assignment)
                .SingleAsync(x => x.Id == serialId);

            if(serial.Assignment != null)
            {
                // TODO: not sure what's going on here
                _context.KeyAssignments.Update(serial.Assignment);
                serial.Assignment.ExpiresAt = DateTime.Parse(date);
                // TODO: track update assignment?
            }
            else 
            {
                serial.Assignment = new KeyAssignment
                {
                    PersonId = personId,
                    ExpiresAt = DateTime.Parse(date)
                };

                serial.Assignment.Person = await _context.People
                    .Include(p => p.User)
                    .SingleAsync(p => p.Id == personId);

                _context.KeyAssignments.Add(serial.Assignment);
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
                
            _context.KeyAssignments.Remove(keySerial.Assignment);
            keySerial.Assignment = null;
            keySerial.KeyAssignmentId = null;

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