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
    [Authorize(Policy = "SpaceMasterAccess")]
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
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var workstation = await _context.Workstations
                .Where(w => w.Team.Name == Team && w.Active && w.Assignment == null && w.Name.StartsWith(q, comparison))
                .AsNoTracking().ToListAsync();

            return Json(workstation);
        }

        public async Task<IActionResult> Details(int id)
        {
            var workstation = await _context.Workstations
                .Where(w => w.Team.Name == Team && w.Active && w.Id == id)
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person.User)
                .AsNoTracking()
                .SingleOrDefaultAsync();
            return Json(workstation);
        }

        public async Task<IActionResult> GetWorkstationsInSpace(int spaceId)
        {
            var workstations = await _context.Workstations
                .Where(x => x.Space.Id == spaceId && x.Team.Name == Team && x.Active)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person.User)
                .AsNoTracking()
                .ToListAsync();
            return Json(workstations);
        }

        public async Task<IActionResult> CommonAttributeKeys()
        {
            var keys = await _context.WorkstationAttributes
                .Where(w => w.Workstation.Team.Name == Team)
                .GroupBy(w => w.Key)
                .Take(5)
                .OrderByDescending(w => w.Count())
                .Select(w => w.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        public async Task<IActionResult> ListAssigned(int personId)
        {
            var workstationAssignments = await _context.Workstations
                .Where(w => w.Assignment.PersonId == personId && w.Team.Name==Team)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person.User)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstationAssignments);
        }

        public async Task<IActionResult> List()
        {
            var workstations = await _context.Workstations
                .Where(w => w.Team.Name == Team)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person.User)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstations);
        }

        public async Task<IActionResult> Create([FromBody] Workstation workstation)
        {
            // TODO Make sure user has permission; Protect from overpost
            if (ModelState.IsValid)
            {
                if (workstation.Space != null)
                {
                    var space = await _context.Spaces.SingleAsync(s => s.RoomKey == workstation.Space.RoomKey);
                    workstation.Space = space;
                }
                _context.Workstations.Add(workstation);
                await _eventService.TrackCreateWorkstation(workstation);
                await _context.SaveChangesAsync();
            }

            return Json(workstation);
        }

        public async Task<IActionResult> Assign(int workstationId, int personId, string date)
        {
            // TODO make sure user has permission
            if (ModelState.IsValid)
            {
                var workstation = await _context.Workstations.Where(w => w.Team.Name == Team).Include(w => w.Space)
                    .SingleAsync(w => w.Id == workstationId);
                workstation.Assignment = new WorkstationAssignment{PersonId = personId, ExpiresAt = DateTime.Parse(date)};
                workstation.Assignment.Person =
                    await _context.People.Include(p => p.User).Include(p=> p.Team).SingleAsync(p => p.Id == personId);

                if (workstation.Team.Name != Team)
                {
                    Message = "Workstation is not part of this team!";
                    return BadRequest(workstation);
                }
                if (workstation.Assignment.Person.Team.Name != Team)
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

                await _context.SaveChangesAsync();
                await _eventService.TrackAssignWorkstation(workstation);
                return Json(workstation);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke([FromBody] Workstation workstation)
        {
            // TODO permission
            if (ModelState.IsValid)
            {
                var workstationToUpdate = await _context.Workstations.Where(x => x.Team.Name == Team)
                    .Include(w => w.Assignment).ThenInclude(w => w.Person.User)
                    .SingleAsync(w => w.Id == workstation.Id);

                _context.WorkstationAssignments.Remove(workstationToUpdate.Assignment);
                workstationToUpdate.Assignment = null;
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignWorkstation(workstation);
                return Json(null);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Update([FromBody]Workstation workstation)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var w = await _context.Workstations.Where(x => x.Team.Name == Team)
                    .SingleAsync(x => x.Id == workstation.Id);
                    
                w.Name = workstation.Name;
                w.Tags = workstation.Tags;

                //eq.Attributes.Clear();
                //equipment.Attributes.ForEach(x => eq.AddAttribute(x.Key, x.Value));

                await _context.SaveChangesAsync();
                return Json(w);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories
                .Where(h => h.AssetType == "Workstation" && h.Workstation.Team.Name == Team && h.WorkstationId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}