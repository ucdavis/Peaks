using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Keas.Core.Models;
using Keas.Mvc.Models.KeyViewModels;
using Dapper;
using Keas.Core.Extensions;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Cors;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.KeyMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/keys/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class KeysController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly ISecurityService _securityService;

        public KeysController(ApplicationDbContext context, IEventService eventService, ISecurityService securityService)
        {
            _context = context;
            _eventService = eventService;
            _securityService = securityService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Key>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search(string q)
        {
            var keys =
            from key in _context.Keys
                .Where(x => x.Team.Slug == Team
                        && x.Active
                        && (EF.Functions.Like(x.Name, q.EfStartsWith()) || EF.Functions.Like(x.Code, q.EfStartsWith())))
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

        /// <summary>
        /// List all keys for a team
        /// </summary>
        /// <param name="filter">0 = ShowActive, 1 = ShowInactive, 2 = ShowAll. Defaults to Show Active</param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Key>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(ApiParameterModels.Filter filter = ApiParameterModels.Filter.ShowActive)
        {
            var teamId = await _context.Teams.Where(a => a.Slug == Team).Select(s => s.Id).SingleAsync();

            var sql = KeyQueries.List;
            int active1 = 1;
            int active2 = 1;

            switch (filter)
            {
                case ApiParameterModels.Filter.ShowActive:
                    //Use defaults
                    break;
                case ApiParameterModels.Filter.ShowInactive:
                    active1 = 0;
                    active2 = 0;
                    break;
                case ApiParameterModels.Filter.ShowAll:
                    active1 = 1;
                    active2 = 0;
                    break;
                default:
                    throw new Exception("Unknown filter value");
            }

            var result = _context.Database.GetDbConnection().Query(sql, new { teamId, active1, active2 });

            var keys = result.Select(r => new
            {
                key = new Key
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    Notes = r.Notes,
                    TeamId = r.TeamId,
                    Tags = r.Tags,
                    Active = r.Active
                },
                id = r.Id,
                SpacesCount = r.SpacesCount,
                SerialsInUseCount = r.SerialsInUseCount,
                SerialsTotalCount = r.SerialsTotalCount
            });

            return Json(keys);
        }

        /// <summary>
        /// Show details of a key
        /// </summary>
        /// <param name="id">The Key Id</param>
        /// <param name="includeSerial">Includes serials any related assignments, and the person</param>
        /// <param name="includeSpace">Include any related spaces</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Key), StatusCodes.Status200OK)]
        public async Task<IActionResult> Details(int id, bool includeSerial = false, bool includeSpace = false)
        {
            var keyQuery = _context.Keys
                .IgnoreQueryFilters()
                .Where(a => a.Team.Slug == Team)
                .AsNoTracking();

            if (includeSerial)
            {
                keyQuery = keyQuery
                    .Include(a => a.Serials)
                    .ThenInclude(a => a.KeySerialAssignment)
                    .ThenInclude(a => a.Person);
            }

            if (includeSpace)
            {
                keyQuery = keyQuery
                    .Include(a => a.KeyXSpaces)
                    .ThenInclude(a => a.Space);
            }

            var keys = await keyQuery.SingleOrDefaultAsync(x => x.Id == id);

            if (keys == null)
            {
                return NotFound();
            }
            return Json(keys);
        }

        // list all keys for a space
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Key>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKeysInSpace(int spaceId)
        {
            var joins = await _context.KeyXSpaces
                .IgnoreQueryFilters()
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
        [ProducesResponseType(typeof(Key), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody]CreateKeyViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (await _context.Keys.AnyAsync(a => a.Team.Slug == Team && a.Code == model.Code.Trim().ToUpper()))
            {
                return BadRequest("Code already exists");
                //throw new Exception($"Duplicate Code detected for Team. {model.Code}");
            }

            // create key
            var key = new Key()
            {
                Name = model.Name.Trim(),
                Code = model.Code.Trim().ToUpper(),
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

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Key), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Update(int id, [FromBody]UpdateKeyViewModel model) //This is currently identical to CreateKeyViewModel
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // get full object
            var key = await _context.Keys
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .Include(x => x.Serials)
                    .ThenInclude(serials => serials.KeySerialAssignment)
                        .ThenInclude(assignment => assignment.Person)
                .SingleAsync(x => x.Id == id);

            if (await _context.Keys.AnyAsync(a => a.Id != key.Id && a.Team.Slug == Team && a.Code == model.Code.Trim().ToUpper()))
            {
                return BadRequest();
                //throw new Exception($"Duplicate Code detected for Team. {model.Code}");
            }

            key.Code = model.Code.Trim().ToUpper();
            key.Name = model.Name.Trim();
            key.Tags = model.Tags;
            key.Notes = model.Notes;
           
            await _eventService.TrackUpdateKey(key);
            await _context.SaveChangesAsync();
            return Json(key);
        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Key), StatusCodes.Status200OK)]
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

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(KeyXSpace), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> AssociateSpace(int id, [FromBody] AssociateKeyViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await _securityService.IsSpaceInTeam(Team, model.SpaceId))
            {
                return BadRequest("Space not in Team");
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

            await _eventService.TrackAssignKeySpace(key, space);
            await _context.SaveChangesAsync();
            return Json(association);
        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Key), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> DisassociateSpace(int id, [FromBody] DisassociateKeyViewModel model)
        {
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
                .IgnoreQueryFilters()
                .SingleAsync(x => x.Id == model.SpaceId);

            // find existing relationship
            var association = await _context.KeyXSpaces
                .SingleOrDefaultAsync(x => x.KeyId == id && x.SpaceId == space.Id);

            if (association == null)
            {
                return BadRequest();
            }

            _context.KeyXSpaces.Remove(association);

            await _eventService.TrackUnassignKeySpace(key, space);
            await _context.SaveChangesAsync();
            return Json(key);
        }

        /// <summary>
        /// Takes the top 5 history records
        /// </summary>
        /// <param name="id"></param>
        /// <param name="max">Defaults to 5</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<History>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int id, int max = 5)
        {
            var history = await _context.Histories
                .Where(x => x.Key.Team.Slug == Team
                    && x.AssetType == "Key"
                    && x.KeyId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(max)
                .AsNoTracking()
                .ToListAsync();

            return Json(history);
        }
    }
}
