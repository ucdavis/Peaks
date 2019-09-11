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
using Keas.Mvc.Extensions;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.SpaceMasterAccess)]
    public class WorkstationsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public WorkstationsController(ApplicationDbContext context, IEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var equipment = await _context.Workstations
                .Where(x => x.Team.Slug == Team && x.Active &&
                (x.Name.StartsWith(q, comparison) || x.Space.BldgName.IndexOf(q, comparison) >= 0 // case-insensitive .Contains
                    || x.Space.RoomNumber.StartsWith(q, comparison)))
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }


        public async Task<IActionResult> SearchInSpace(int spaceId, string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var equipment = await _context.Workstations
                .Where(x => x.Team.Slug == Team && x.SpaceId == spaceId && x.Active &&
                (x.Name.StartsWith(q, comparison) || x.Space.BldgName.IndexOf(q, comparison) >= 0 // case-insensitive .Contains
                    || x.Space.RoomNumber.StartsWith(q, comparison)))
                .Include(x => x.Space).Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking().ToListAsync();

            return Json(equipment);
        }

        public async Task<IActionResult> GetWorkstationsInSpace(int spaceId)
        {
            var workstations = await _context.Workstations
                .Where(x => x.Space.Id == spaceId && x.Team.Slug == Team && x.Active)
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .AsNoTracking()
                .ToListAsync();
            return Json(workstations);
        }

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

        public async Task<IActionResult> List()
        {
            var workstations = await _context.Workstations
                .Where(w => w.Team.Slug == Team)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstations);
        }

        public async Task<IActionResult> Details(int id)
        {
            var workstations = await _context.Workstations
                .Where(w => w.Team.Slug == Team)
                .Include(w => w.Assignment)
                    .ThenInclude(w => w.Person)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking()
                .SingleAsync(w => w.Id == id);

            return Json(workstations);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Workstation workstation)
        {
            // TODO Make sure user has permission; Protect from overpost
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            if (workstation.Id != 0) // if creating new equipment, this should always be 0
            {
                return BadRequest();
            }
            if (workstation.Space != null)
            {
                var space = await _context.Spaces.SingleAsync(s => s.RoomKey == workstation.Space.RoomKey);
                workstation.Space = space;
            }
            _context.Workstations.Add(workstation);
            await _eventService.TrackCreateWorkstation(workstation);
            await _context.SaveChangesAsync();


            return Json(workstation);
        }

        [HttpPost]
        public async Task<IActionResult> Assign(int workstationId, int personId, string date)
        {
            // TODO make sure user has permission
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var workstation = await _context.Workstations.Where(w => w.Team.Slug == Team && w.Active)
                .Include(w => w.Space).Include(t => t.Team).Include(w => w.Assignment).ThenInclude(a => a.Person).SingleAsync(w => w.Id == workstationId);

            if (workstation.Assignment != null)
            {
                _context.WorkstationAssignments.Update(workstation.Assignment);
                workstation.Assignment.ExpiresAt = DateTime.Parse(date);
                workstation.Assignment.RequestedById = User.Identity.Name;
                workstation.Assignment.RequestedByName = User.GetNameClaim();
                await _eventService.TrackWorkstationAssignmentUpdated(workstation);
            }
            else
            {
                workstation.Assignment = new WorkstationAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                workstation.Assignment.Person =
                await _context.People.Include(p => p.Team).SingleAsync(p => p.Id == personId);
                workstation.Assignment.RequestedById = User.Identity.Name;
                workstation.Assignment.RequestedByName = User.GetNameClaim();

                if (workstation.Assignment.Person.Team.Slug != Team)
                {
                    Message = "User is not part of this team!";
                    return BadRequest(workstation);
                }

                if (workstation.TeamId != workstation.Assignment.Person.TeamId)
                {
                    Message = "Workstation team did not match person's team!";
                    return BadRequest(workstation);
                }

                _context.WorkstationAssignments.Add(workstation.Assignment);
                await _eventService.TrackAssignWorkstation(workstation);
            }

            await _context.SaveChangesAsync();
            return Json(workstation);
        }

        [HttpPost]
        public async Task<IActionResult> Revoke(int id)
        {
            // TODO permission

            var workstation = await _context.Workstations.Where(x => x.Team.Slug == Team)
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

            _context.WorkstationAssignments.Remove(workstation.Assignment);
            await _eventService.TrackUnAssignWorkstation(workstation);
            await _context.SaveChangesAsync();
            return Json(null);
        }

        [HttpPost]
        public async Task<IActionResult> Update([FromBody]Workstation workstation)
        {
            //TODO: check permissions
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

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var workstation = await _context.Workstations
                .Where(x => x.Team.Slug == Team)
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
                    workstation.Assignment = null;
                }

                workstation.Active = false;
                await _eventService.TrackWorkstationDeleted(workstation);
                await _context.SaveChangesAsync();

                transaction.Commit();
                return Json(null);
            }

        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(h => h.AssetType == "Workstation" && h.Workstation.Team.Slug == Team && h.WorkstationId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}
