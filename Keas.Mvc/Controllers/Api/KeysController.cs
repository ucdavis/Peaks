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
using Keas.Mvc.Models.KeyViewModels;
using Dapper;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
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

            var keys =
            from key in _context.Keys
                .Where(x => x.Team.Slug == Team
                        && x.Active
                        && (x.Name.StartsWith(q, comparison) || x.Code.StartsWith(q, comparison)))
                .Include(x => x.Serials)
                .Include(x => x.KeyXSpaces)
                    .ThenInclude(xs => xs.Space)
                .AsNoTracking()
            select new
            {
                key = key,
                id = key.Id,
                code = key.Code,
                serialsTotalCount = (from s in key.Serials where s.Status == "Active" select s).Count(),
                serialsInUseCount =
               (from s in key.Serials where s.KeySerialAssignment != null && s.Status == "Active" select s).Count(),
                spacesCount =
               (key.KeyXSpaces).Count(),
            };
            return Json(await keys.ToListAsync());
        }

        // List all keys for a team
        public async Task<IActionResult> List()
        {
            var teamId = await _context.Teams.Where(a => a.Slug == Team).Select(s => s.Id).SingleAsync();

            var sql = KeyQueries.List;

            var result = _context.Database.GetDbConnection().Query(sql, new { teamId });

            var keys = result.Select(r => new
            {
                key = new Key
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    Notes = r.Notes,
                    TeamId = r.TeamId,
                    Tags = r.Tags
                },
                id = r.Id,
                SpacesCount = r.SpacesCount,
                SerialsInUseCount = r.SerialsInUseCount,
                SerialsTotalCount = r.SerialsTotalCount
            });

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
                            .ThenInclude(assignment => assignment.Person)
                .AsNoTracking()
                .ToListAsync();

            // you can't do both select and include
            // so map after fetch
            var keys =
            from j in joins
            select new
            {
                key = j.Key,
                id = j.KeyId,
                serialsTotalCount = (from s in j.Key.Serials where s.Status == "Active" select s).Count(),
                serialsInUseCount =
                    (from s in j.Key.Serials where s.KeySerialAssignment != null && s.Status == "Active" select s).Count(),
                spacesCount = 0 // doesn't matter on spaces page
            };

            return Json(keys.ToList());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]CreateKeyViewModel model)
        {
            // TODO Make sure user has permissions
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (await _context.Keys.AnyAsync(a => a.Team.Slug == Team && a.Code.Equals(model.Code.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest();
                //throw new Exception($"Duplicate Code detected for Team. {model.Code}");
            }

            // create key
            var key = new Key()
            {
                Name = model.Name.Trim(),
                Code = model.Code.Trim(),
                Notes = model.Notes,
                Tags = model.Tags,
            };

            // get and assign team
            var team = await _context.Teams
                .SingleAsync(t => t.Slug == Team);

            key.Team = team;

            _context.Keys.Add(key);           
            await _eventService.TrackCreateKey(key);
            await _context.SaveChangesAsync();
            return Json(key);
        }

        [HttpPost]
        public async Task<IActionResult> Update(int id, [FromBody]UpdateKeyViewModel model)
        {
            //TODO: check permissions, make sure SN isn't edited 
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // get full object
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .Include(x => x.Serials)
                    .ThenInclude(serials => serials.KeySerialAssignment)
                        .ThenInclude(assignment => assignment.Person)
                .SingleAsync(x => x.Id == id);

            if (await _context.Keys.AnyAsync(a => a.Id != key.Id && a.Team.Slug == Team && a.Code.Equals(model.Code.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest();
                //throw new Exception($"Duplicate Code detected for Team. {model.Code}");
            }

            key.Code = model.Code.Trim();
            key.Name = model.Name.Trim();
            key.Tags = model.Tags;
            key.Notes = model.Notes;
           
            await _eventService.TrackUpdateKey(key);
            await _context.SaveChangesAsync();
            return Json(key);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .Include(x => x.Serials)
                    .ThenInclude(serials => serials.KeySerialAssignment)
                        .ThenInclude(assignment => assignment.Person)
                .Include(x => x.KeyXSpaces)
                .SingleAsync(x => x.Id == id);

            using (var transaction = _context.Database.BeginTransaction())
            {

                _context.Keys.Update(key);

                if (key.Serials.Count > 0)
                {
                    foreach (var serial in key.Serials.ToList())
                    {
                        _context.KeySerials.Update(serial);
                        if (serial.KeySerialAssignment != null)
                        {
                            await _eventService.TrackUnAssignKeySerial(serial); // call before we remove person info
                            _context.KeySerialAssignments.Remove(serial.KeySerialAssignment);
                        }
                        serial.Active = false;
                    }
                }

                if (key.KeyXSpaces.Count > 0)
                {
                    foreach (var keyXSpace in key.KeyXSpaces.ToList())
                    {
                        _context.KeyXSpaces.Remove(keyXSpace);
                    }
                }

                key.Active = false;
                await _eventService.TrackKeyDeleted(key);
                await _context.SaveChangesAsync();                

                transaction.Commit();
                return Json(null);
            }

        }

        [HttpPost]
        public async Task<IActionResult> AssociateSpace(int id, [FromBody] AssociateKeyViewModel model)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // find key
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team && x.Active)
                .Include(x => x.KeyXSpaces)
                    .ThenInclude(x => x.Space)
                .SingleAsync(x => x.Id == id);

            // find space
            var space = await _context.Spaces
                .SingleAsync(x => x.Id == model.SpaceId);

            // check for existing relationship
            var association = await _context.KeyXSpaces
                .SingleOrDefaultAsync(x => x.KeyId == id && x.SpaceId == model.SpaceId);

            if (association != null)
            {
                return BadRequest("Association already exists.");
            }

            // create new association and save it
            association = new KeyXSpace()
            {
                KeyId = key.Id,
                SpaceId = space.Id,
            };

            _context.KeyXSpaces.Add(association);
            //await _eventService.TrackAssignKeySerial(serial);

            await _context.SaveChangesAsync();
            return Json(association);
        }

        [HttpPost]
        public async Task<IActionResult> DisassociateSpace(int id, [FromBody] DisassociateKeyViewModel model)
        {
            // TODO Make sure user has permission, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // find key
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team && x.Active)
                .Include(x => x.KeyXSpaces)
                    .ThenInclude(x => x.Space)
                .SingleAsync(x => x.Id == id);

            // find space
            var space = await _context.Spaces
                .SingleAsync(x => x.Id == model.SpaceId);

            // find existing relationship
            var association = await _context.KeyXSpaces
                .SingleOrDefaultAsync(x => x.KeyId == id && x.SpaceId == space.Id);

            if (association == null)
            {
                return BadRequest();
            }

            _context.KeyXSpaces.Remove(association);
            //await _eventService.TrackUnAssignKeySerial(serial);

            await _context.SaveChangesAsync();
            return Json(key);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(x => x.Key.Team.Slug == Team
                    && x.AssetType == "Key"
                    && x.KeyId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking()
                .ToListAsync();

            return Json(history);
        }
    }
}
