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
    [Authorize(Policy = "AccessMasterAccess")]
    public class AccessController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public AccessController(ApplicationDbContext context, IEventService eventService)
        {
            this._context = context;
            _eventService = eventService;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var access = await _context.Access.Include(x => x.Assignments).ThenInclude(x => x.Person.User)
                .Where(x => x.Team.Slug == Team && x.Active &&
                (x.Name.StartsWith(q, comparison))) //|| x.SerialNumber.StartsWith(q, comparison)))
                .AsNoTracking().ToListAsync();

            return Json(access);
        }

        public async Task<IActionResult> ListAssigned(int personId) {
            var assignedAccess = await _context.Access 
                .Where(x => x.Active && x.Team.Slug == Team && x.Assignments.Any(y => y.Person.Id == personId))
                .Include(x => x.Assignments).ThenInclude(x => x.Person.User)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(assignedAccess);
        }

        public async Task<IActionResult> List()
        {
            var accessList = await _context.Access
                .Where(x => x.Team.Slug == Team)
                .Include(x=> x.Assignments)
                .ThenInclude(x => x.Person)
                .ThenInclude(x => x.User)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(accessList);
        }

        public async Task<IActionResult> Create([FromBody]Access access)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                _context.Access.Add(access);
                await _context.SaveChangesAsync();
                await _eventService.TrackCreateAccess(access);
                return Json(access);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Assign(int accessId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure access exists, makes sure access is in this team
            if (ModelState.IsValid)
            {
                var access = await _context.Access.Where(x => x.Id == accessId && x.Team.Slug == Team)
                    .Include(x => x.Assignments).SingleAsync();
                var accessAssingment = new AccessAssignment{
                    AccessId = accessId,
                    PersonId = personId,
                    ExpiresAt = DateTime.Parse(date),
                };
                accessAssingment.Person = await _context.People.Include(p => p.User).SingleAsync(p => p.Id == personId);
                access.Assignments.Add(accessAssingment);
                await _context.SaveChangesAsync();
                await _eventService.TrackAssignAccess(accessAssingment, Team);
                return Json(accessAssingment);
            }
            return BadRequest(ModelState);
        }
        public async Task<IActionResult> Update([FromBody]Access access)
        {
            //TODO: check permissions, make sure SN isn't edited 
            if (ModelState.IsValid)
            {
                var a = await _context.Access.Where(x => x.Team.Slug == Team)
                    .SingleAsync(x => x.Id == access.Id);
                a.Name = access.Name;
                a.Tags = access.Tags;
                await _context.SaveChangesAsync();
                await _eventService.TrackUpdateAccess(a);
                return Json(access);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke([FromBody] AccessAssignment accessAssignment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                _context.AccessAssignments.Remove(accessAssignment);
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignAccess(accessAssignment, Team);
                return Json(accessAssignment);
            }
            return BadRequest(ModelState);
        }
    }
}