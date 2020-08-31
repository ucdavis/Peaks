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
                .Include(x => x.Assignments)
                .ThenInclude(x => x.Person)
                .Include(x => x.Team)
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

            var access = await _context.Access.Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignments).SingleAsync(x => x.Id == accessId);

            var accessAssignment = new AccessAssignment
            {
                AccessId = accessId,
                PersonId = personId,
                RequestedById = User.Identity.Name,
                RequestedByName = User.GetNameClaim(),
                ExpiresAt = DateTime.Parse(date),
            };

            accessAssignment.Person = await _context.People.SingleAsync(p => p.Id == personId);
            access.Assignments.Add(accessAssignment);
            await _eventService.TrackAssignAccess(accessAssignment, Team);
            await _context.SaveChangesAsync();
            return Json(accessAssignment);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Access), StatusCodes.Status200OK)]
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
        public async Task<IActionResult> UpdateAssignment([FromBody] AccessAssignment accessAssignment)
        {
            var assignment = await _context.AccessAssignments
                .Where(x => x.Access.Team.Slug == Team)
                .Include(x => x.Person)
                .Include(x => x.Access)
                .ThenInclude(x => x.Team)
                .SingleAsync(x => x.Id == accessAssignment.Id);

            assignment.ExpiresAt = accessAssignment.ExpiresAt;
            await _context.SaveChangesAsync();
            return Json(null);
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
