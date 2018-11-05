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

        public async Task<IActionResult> GetKeysInSpace(int spaceId)
        {
            var keys = await _context.KeyXSpaces
                .Where(x => x.Space.Id == spaceId && x.Key.Team.Slug == Team && x.Key.Active)
                .Include(x => x.Key)
                .ThenInclude(key => key.Serials)
                .ThenInclude(serials => serials.Assignment)
                .ThenInclude(assignment => assignment.Person.User)
                .AsNoTracking()
                .ToListAsync();
            return Json(keys);
        }

        // List all keys for a team
        public async Task<IActionResult> List()
        {
            var keys = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .AsNoTracking()
                .ToArrayAsync();
            return Json(keys);
        }

        public async Task<IActionResult> Create([FromBody]Key key)
        {
            // TODO Make sure user has permissions
            // TODO Does the space come with this request? Or handle in separate action?
            // TODO Does the serials come with this request? Or handle in separate action?
            if (!ModelState.IsValid)
            {
                return Json(key);
            }

            _context.Keys.Add(key);
            await _context.SaveChangesAsync();
            await _eventService.TrackCreateKey(key);

            return Json(key);
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