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
using System.Net;
using System.Net.Mime;
using System.Threading.Tasks;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.AccessMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/access/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class AccessController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly ISecurityService _securityService;

        public AccessController(ApplicationDbContext context, IEventService eventService, ISecurityService securityService)
        {
            this._context = context;
            _eventService = eventService;
            _securityService = securityService;
        }


        [ApiExplorerSettings(IgnoreApi = true)]
        public string GetTeam()
        {
            return Team;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Access>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            var access = await _context.Access.Include(x => x.Assignments).ThenInclude(x => x.Person)
                .Where(x => x.Team.Slug == Team && x.Active &&
                EF.Functions.Like(x.Name, q.EfStartsWith())) //|| x.SerialNumber.StartsWith(q, comparison)))
                .AsNoTracking().ToListAsync();
            return Json(access);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Access>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAssigned(int personId)
        {
            var assignedAccess = await _context.Access
                .Where(x => x.Active && x.Team.Slug == Team && x.Assignments.Any(y => y.Person.Id == personId))
                .Include(x => x.Assignments).ThenInclude(x => x.Person)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(assignedAccess);
        }


        /// <summary>
        /// List Access
        /// </summary>
        /// <param name="filter">0 = ShowActive, 1 = ShowInactive, 2 = ShowAll. Defaults to Show Active</param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Access>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(ApiParameterModels.Filter filter = ApiParameterModels.Filter.ShowActive)
        {
            var accessListQuery = _context.Access
                .Where(x => x.Team.Slug == Team)
                .Select(x => new Access
                {
                    Id = x.Id,
                    Name = x.Name,
                    Notes = x.Notes,
                    Tags = x.Tags,
                    Active = x.Active,
                    Assignments = x.Assignments.Select(y => new AccessAssignment {
                        AccessId = y.AccessId,
                        Access = null, // don't send nested/recursive access data
                        ExpiresAt = y.ExpiresAt,
                        Id = y.Id,
                        Person = y.Person,
                        PersonId = y.PersonId,
                    }).ToList(),
                    Team = x.Team,
                })
                // .Include(x => x.Assignments)
                // .ThenInclude(x => x.Person)
                .AsNoTracking();

            switch (filter)
            {
                case ApiParameterModels.Filter.ShowActive:
                    //Use defaults
                    break;
                case ApiParameterModels.Filter.ShowInactive:
                    accessListQuery = accessListQuery.IgnoreQueryFilters().Where(a => !a.Active);
                    break;
                case ApiParameterModels.Filter.ShowAll:
                    accessListQuery = accessListQuery.IgnoreQueryFilters();
                    break;
                default:
                    throw new Exception("Unknown filter value");
            }

            var accessList = await accessListQuery.ToArrayAsync();

            return Json(accessList);
        }


        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Access), StatusCodes.Status200OK)]
        public async Task<IActionResult> Details(int id)
        {
            var access = await _context.Access
                .IgnoreQueryFilters()
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignments)
                .ThenInclude(x => x.Person)
                .Include(x => x.Team)
                .AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);


            if (access == null)
            {
                return NotFound();
            }

            return Json(access);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Access), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody] Access access)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (access.Id != 0) // if creating new accecss, this should always be 0
            {
                return BadRequest();
            }

            //Validate passed team matches workstation team.
            if (!await _securityService.IsTeamValid(Team, access.TeamId))
            {
                return BadRequest("Invalid Team");
            }

            if (access.Assignments != null && access.Assignments.Any())
            {
                return BadRequest("Don't assign person with create.");
            }

            _context.Access.Add(access);
            await _eventService.TrackCreateAccess(access);
            await _context.SaveChangesAsync();
            return Json(access);
        }

        [HttpPost]
        [ProducesResponseType(typeof(AccessAssignment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Assign(int accessId, int personId, string date)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Verify access is in team and exists
            var access = await _context.Access.Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignments).SingleAsync(x => x.Id == accessId);

            //Verify person is in team. 
            if (!await _securityService.IsPersonInTeam(Team, personId))
            {
                return BadRequest("User is not part of this team!");
            }


            var assignment = await _context.AccessAssignments.Where(x => x.AccessId == accessId && x.PersonId == personId)
                .Include(x => x.Person)
                .SingleOrDefaultAsync();

            var requestedByPerson = await _securityService.GetPerson(Team);

            if (assignment != null) 
            {
                assignment.ExpiresAt = DateTime.Parse(date); //TODO Verify a good date. (In future, etc.)
                assignment.RequestedById = requestedByPerson.UserId;
                assignment.RequestedByName = requestedByPerson.Name;
                await _eventService.TrackAssignAccessUpdate(assignment, Team);
            } else 
            {
                assignment = new AccessAssignment
                {
                    AccessId = accessId,
                    PersonId = personId,
                    RequestedById = requestedByPerson.UserId,
                    RequestedByName = requestedByPerson.Name,
                    ExpiresAt = DateTime.Parse(date),
                };

                assignment.Person = await _context.People.SingleAsync(p => p.Id == personId);
                access.Assignments.Add(assignment);
                await _eventService.TrackAssignAccess(assignment, Team);
            }

            await _context.SaveChangesAsync();
            return Json(assignment);
        }

        /// <summary>
        /// Only Name, Notes, and Tags fields are updated
        /// </summary>
        /// <param name="access"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(Access), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Update([FromBody] Access access)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var a = await _context.Access.Where(x => x.Team.Slug == Team)
                .SingleAsync(x => x.Id == access.Id);

            a.Name = access.Name;
            a.Notes = access.Notes;
            a.Tags = access.Tags;
            await _eventService.TrackUpdateAccess(a);
            await _context.SaveChangesAsync();
            return Json(access);

        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(AccessAssignment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Revoke(int id)
        {
            var assignment = await _context.AccessAssignments
                .Where(x => x.Access.Team.Slug == Team)
                .Include(x => x.Person)
                .Include(x => x.Access)
                .ThenInclude(x => x.Team)
                .SingleAsync(x => x.Id == id);

            await _eventService.TrackUnAssignAccess(assignment, Team);
            _context.AccessAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return Json(null);
        }

        /// <summary>
        /// If there are any assignments, they will be removed before the access record is set to inactive
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Access), StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var access = await _context.Access
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignments)
                    .ThenInclude(x => x.Person)
                .SingleAsync(x => x.Id == id);

            using (var transaction = _context.Database.BeginTransaction())
            {
                _context.Access.Update(access);

                if (access.Assignments.Count > 0)
                {
                    foreach (var assignment in access.Assignments.ToList())
                    {
                        await _eventService.TrackUnAssignAccess(assignment, Team); // call before we remove person info
                        _context.AccessAssignments.Remove(assignment);
                    }
                }

                access.Active = false;
                await _eventService.TrackAccessDeleted(access);
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
        /// <param name="max">the max number of record to take. Defaults to 5</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<History>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int id, int max = 5)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "Access" && x.Access.Team.Slug == Team && x.AccessId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(max)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}
