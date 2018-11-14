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
    public class KeysController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public KeysController(ApplicationDbContext context, IEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;

            var keys = await _context.Keys
                .Where(x => x.Team.Slug == Team 
                        && x.Active
                        && (x.Name.StartsWith(q, comparison) || x.Code.StartsWith(q, comparison)))
                .Include(x => x.Serials)
                .Include(x => x.KeyXSpaces)
                    .ThenInclude(xs => xs.Space)
                .AsNoTracking().ToListAsync();

            return Json(keys);
        }

        // List all keys for a team
        public async Task<IActionResult> List()
        {
            var keys = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .Include(x => x.Serials)
                    .ThenInclude(serials => serials.KeySerialAssignment)
                        .ThenInclude(assignment => assignment.Person.User)
                .AsNoTracking()
                .ToListAsync();

            return Json(keys);
        }

        // list all keys for a space
        public async Task<IActionResult> GetKeysInSpace(int spaceId)
        {
            var joins = await _context.KeyXSpaces
                .Where(x => x.Space.Id == spaceId
                        && x.Key.Team.Slug == Team
                        && x.Key.Active)
                .Include(x => x.Key)
                    .ThenInclude(key => key.Serials)
                        .ThenInclude(serials => serials.KeySerialAssignment)
                            .ThenInclude(assignment => assignment.Person.User)
                .AsNoTracking()
                .ToListAsync();

            // you can't do both select and include
            // so map after fetch
            var keys = joins.Select(k => k.Key);

            return Json(keys);
        }

        public async Task<IActionResult> Create([FromBody]Key key)
        {
            // TODO Make sure user has permissions
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            // get and assign team
            var team = await _context.Teams
                .SingleAsync(t => t.Slug == Team);

            key.Team = team;

            _context.Keys.Add(key);
            await _context.SaveChangesAsync();
            await _eventService.TrackCreateKey(key);

            return Json(key);
        }
        
        public async Task<IActionResult> Update([FromBody]Key updateRequest)
        {
            //TODO: check permissions, make sure SN isn't edited 
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .SingleAsync(x => x.Id == updateRequest.Id);

            key.Name = updateRequest.Name;
            // TODO: Should this also be updating serials? KeyXSpaces?

            await _context.SaveChangesAsync();
            await _eventService.TrackUpdateKey(key);
            return Json(key);
        }

        public async Task<IActionResult> AssociateSpace(int keyId, int spaceId)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //// find key
            //var key = await _context.Keys
            //    .Where(x => x.Team.Slug == Team && x.Active)
            //    .Include(x => x.KeyXSpaces)
            //        .ThenInclude(x => x.Space)
            //    .SingleAsync(x => x.Id == keyId);

            //// find space
            //var space = await _context.Spaces
            //    .SingleAsync(x => x.Id == spaceId);

            // check for existing relationship
            var association = await _context.KeyXSpaces
                .SingleOrDefaultAsync(x => x.KeyId == keyId && x.SpaceId == spaceId);

            if (association != null)
            {
                return BadRequest();
            }

            // create new association and save it
            association = new KeyXSpace()
            {
                KeyId = keyId,
                SpaceId = spaceId,
            };

            _context.KeyXSpaces.Add(association);
            //await _eventService.TrackAssignKeySerial(serial);

            await _context.SaveChangesAsync();
            return Json(association);
        }

        public async Task<IActionResult> DisassociateSpace(int keyId, int spaceId)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //// find key
            //var key = await _context.Keys
            //    .Where(x => x.Team.Slug == Team && x.Active)
            //    .Include(x => x.KeyXSpaces)
            //        .ThenInclude(x => x.Space)
            //    .SingleAsync(x => x.Id == keyId);

            //// find space
            //var space = await _context.Spaces
            //    .SingleAsync(x => x.Id == spaceId);

            // find existing relationship
            var association = await _context.KeyXSpaces
                .SingleOrDefaultAsync(x => x.KeyId == keyId && x.SpaceId == spaceId);

            if (association == null)
            {
                return BadRequest();
            }

            _context.KeyXSpaces.Remove(association);
            //await _eventService.TrackUnAssignKeySerial(serial);

            await _context.SaveChangesAsync();
            return Json(new { });
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