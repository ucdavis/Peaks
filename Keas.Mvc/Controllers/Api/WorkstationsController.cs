using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.SpaceMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/workstations/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class WorkstationsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly ISecurityService _securityService;

        public WorkstationsController(ApplicationDbContext context, IEventService eventService, ISecurityService securityService)
        {
            _context = context;
            _eventService = eventService;
            _securityService = securityService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Workstation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search(string q)
        {
            var equipment = await _context.Workstations
                .Where(x => x.Team.Slug == Team && x.Active &&
                (EF.Functions.Like(x.Name, q.EfStartsWith()) || EF.Functions.Like(x.Space.BldgName, q.EfContains())
                    || EF.Functions.Like(x.Space.RoomNumber, q.EfStartsWith())))
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }


        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Workstation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchInSpace(int spaceId, string q)
        {
            var equipment = await _context.Workstations
                .Where(x => x.Team.Slug == Team && x.SpaceId == spaceId && x.Active &&
                (EF.Functions.Like(x.Name, q.EfStartsWith()) || EF.Functions.Like(x.Space.BldgName, q.EfContains())
                                                                         || EF.Functions.Like(x.Space.RoomNumber, q.EfStartsWith())))
                .Include(x => x.Space).Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Workstation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWorkstationsInSpace(int spaceId)
        {
            var workstations = await _context.Workstations
                .Where(x => x.Space.Id == spaceId && x.Team.Slug == Team && x.Active)
                .IgnoreQueryFilters()
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .AsNoTracking()
                .ToListAsync();
            return Json(workstations);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WorkstationAttribute>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CommonAttributeKeys()
        {
            var keys = await _context.WorkstationAttributes
                .Where(w => w.Workstation.Team.Slug == Team)
                .GroupBy(w => w.Key)
                .Take(5)
                .OrderByDescending(w => w.Count())
                .Select(w => w.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Workstation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAssigned(int personId)
        {
            var workstationAssignments = await _context.Workstations
                .Where(w => w.Assignment.PersonId == personId && w.Team.Slug == Team)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstationAssignments);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filter">0 = ShowActive, 1 = ShowInactive, 2 = ShowAll. Defaults to Show Active</param>
        /// <param name="includeAssignment"></param>
        /// <param name="includeSpace"></param>
        /// <param name="includeAttributes"></param>
        /// <param name="includeTeam"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Workstation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(ApiParameterModels.Filter filter = ApiParameterModels.Filter.ShowActive, bool includeAssignment = true, bool includeSpace = true, bool includeAttributes  = true, bool includeTeam = true)
        {
            var workstationsQuery = _context.Workstations
                .Where(w => w.Team.Slug == Team)
                .AsNoTracking();

            switch (filter)
            {
                case ApiParameterModels.Filter.ShowActive:
                    //Use defaults
                    break;
                case ApiParameterModels.Filter.ShowInactive:
                    workstationsQuery = workstationsQuery.IgnoreQueryFilters().Where(a => !a.Active);
                    break;
                case ApiParameterModels.Filter.ShowAll:
                    workstationsQuery = workstationsQuery.IgnoreQueryFilters();
                    break;
                default:
                    throw new Exception("Unknown filter value");
            }

            if (includeAssignment)
            {
                workstationsQuery = workstationsQuery
                    .Include(w => w.Assignment)
                    .ThenInclude(w => w.Person);
            }

            if (includeSpace)
            {
                workstationsQuery = workstationsQuery
                    .Include(w => w.Space);
            }
            if (includeAttributes)
            {
                workstationsQuery = workstationsQuery
                    .Include(w => w.Attributes);
            }
            if (includeTeam)
            {
                workstationsQuery = workstationsQuery
                    .Include(w => w.Team);
            }
            var workstations = await workstationsQuery.ToArrayAsync();

            return Json(workstations);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="includeAssignment"></param>
        /// <param name="includeSpace"></param>
        /// <param name="includeAttributes"></param>
        /// <param name="includeTeam"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Workstation), StatusCodes.Status200OK)]
        public async Task<IActionResult> Details(int id, bool includeAssignment = true, bool includeSpace = true, bool includeAttributes = true, bool includeTeam = true)
        {
            var workstationQuery = _context.Workstations
                .IgnoreQueryFilters()
                .Where(w => w.Team.Slug == Team)
                .AsNoTracking();

            if (includeAssignment)
            {
                workstationQuery = workstationQuery
                    .Include(w => w.Assignment)
                    .ThenInclude(w => w.Person);
            }

            if (includeSpace)
            {
                workstationQuery = workstationQuery
                    .Include(w => w.Space);
            }
            if (includeAttributes)
            {
                workstationQuery = workstationQuery
                    .Include(w => w.Attributes);
            }
            if (includeTeam)
            {
                workstationQuery = workstationQuery
                    .Include(w => w.Team);
            }

            var workstation = await workstationQuery.SingleOrDefaultAsync(w => w.Id == id);

            if (workstation == null)
            {
                return NotFound();
            }

            return Json(workstation);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Workstation), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody] Workstation workstation)
        {
            
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            if (workstation.Id != 0) // if creating new equipment, this should always be 0
            {
                return BadRequest();
            }

            if (workstation.Space == null)
            {
                return BadRequest("No Space for workstation");
            }

            if (workstation.Assignment != null || workstation.WorkstationAssignmentId.HasValue)
            {
                return BadRequest("Don't assign person with create.");
            }

            //Validate passed team matches workstation team.
            if (!await _securityService.IsTeamValid(Team, workstation.TeamId))
            {
                return BadRequest("Invalid Team");
            }

            //Validate Team has space.
            if (!await _securityService.IsSpaceInTeam(Team, workstation.Space.Id))
            {
                return BadRequest("Space not in Team");
            }

            var space = await _context.Spaces.SingleAsync(s => s.Id == workstation.Space.Id);
            workstation.Space = space;

            _context.Workstations.Add(workstation);
            await _eventService.TrackCreateWorkstation(workstation);
            await _context.SaveChangesAsync();


            return Json(workstation);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Workstation), StatusCodes.Status200OK)]
        public async Task<IActionResult> Assign(int workstationId, int personId, string date)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            //This validates that workstation exists for the team
            var workstation = await _context.Workstations.Where(w => w.Team.Slug == Team && w.Active)
                .Include(w => w.Space)
                .Include(t => t.Team)
                .Include(w => w.Assignment).ThenInclude(a => a.Person)
                .SingleAsync(w => w.Id == workstationId);

            if (!await _securityService.IsPersonInTeam(Team, personId))
            {
                return BadRequest("User is not part of this team!");
            }

            var requestedByPerson = await _securityService.GetPerson(Team);
            
            if (workstation.Assignment != null)
            {
                _context.WorkstationAssignments.Update(workstation.Assignment);

                if (workstation.Assignment.PersonId != personId)
                {
                    return BadRequest("Can't update different person");
                }

                workstation.Assignment.ExpiresAt = DateTime.Parse(date);
                workstation.Assignment.RequestedById = requestedByPerson.UserId;
                workstation.Assignment.RequestedByName = requestedByPerson.Name;
                await _eventService.TrackWorkstationAssignmentUpdated(workstation);
            }
            else
            {
                workstation.Assignment = new WorkstationAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                workstation.Assignment.Person =
                await _context.People.Include(p => p.Team).SingleAsync(p => p.Id == personId);
                workstation.Assignment.RequestedById = requestedByPerson.UserId; 
                workstation.Assignment.RequestedByName = requestedByPerson.Name;


                _context.WorkstationAssignments.Add(workstation.Assignment);
                await _eventService.TrackAssignWorkstation(workstation);
            }

            await _context.SaveChangesAsync();
            return Json(workstation);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> Revoke(int id)
        {
            var workstation = await _context.Workstations.Where(x => x.Team.Slug == Team && x.Active)
                .IgnoreQueryFilters()
                .Include(w => w.Assignment).ThenInclude(w => w.Person)
                .Include(w => w.Space)
                .SingleAsync(w => w.Id == id);
            if (workstation == null)
            {
                return NotFound();
            }
            if (workstation.Assignment == null)
            {
                return BadRequest();
            }

            await _eventService.TrackUnAssignWorkstation(workstation);
            _context.WorkstationAssignments.Remove(workstation.Assignment);
            await _context.SaveChangesAsync();
            return Json(null);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Workstation), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Update([FromBody]Workstation workstation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var w = await _context.Workstations.Where(x => x.Team.Slug == Team)
                .Include(x => x.Space)
                .SingleAsync(x => x.Id == workstation.Id);

            w.Name = workstation.Name;
            w.Tags = workstation.Tags;
            w.Notes = workstation.Notes;

            await _context.SaveChangesAsync();
            return Json(w);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var workstation = await _context.Workstations
                .Where(x => x.Team.Slug == Team && x.Active)
                .IgnoreQueryFilters()
                .Include(x => x.Team)
                .Include(x => x.Assignment)
                    .ThenInclude(x => x.Person)
                .Include(x => x.Space)
                .SingleAsync(x => x.Id == id);

            using (var transaction = _context.Database.BeginTransaction())
            {

                if (workstation.Assignment != null)
                {
                    await _eventService.TrackUnAssignWorkstation(workstation); // call before we remove person info
                    _context.WorkstationAssignments.Remove(workstation.Assignment);
                }

                workstation.Active = false;
                await _eventService.TrackWorkstationDeleted(workstation);
                await _context.SaveChangesAsync();

                transaction.Commit();
                return Json(null);
            }

        }

        /// <summary>
        /// Return history records
        /// Defaults to a max of 5 records returned
        /// </summary>
        /// <param name="id"></param>
        /// <param name="max">Defaults to 5</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<History>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int id, int max = 5)
        {
            var history = await _context.Histories
                .Where(h => h.AssetType == "Workstation" && h.Workstation.Team.Slug == Team && h.WorkstationId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(max)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}
