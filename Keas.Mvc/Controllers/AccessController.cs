using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
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

        public async Task<IActionResult> Search(int teamId, string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var access = await _context.Access.Include(x => x.Assignments).ThenInclude(x => x.Person.User)
                .Where(x => x.TeamId == teamId && x.Active &&
                (x.Name.StartsWith(q, comparison))) //|| x.SerialNumber.StartsWith(q, comparison)))
                .AsNoTracking().ToListAsync();

            return Json(access);
        }

        public async Task<IActionResult> ListAssigned(int personId, int teamId) {
            var assignedAccess = await _context.Access 
                .Where(x => x.Active && x.TeamId == teamId && x.Assignments.Any(y => y.PersonId == personId))
                .Select(a => new Access()
                {
                    Id = a.Id,
                    Name = a.Name,
                    TeamId = a.TeamId,
                    Assignments = a.Assignments.Where(b => b.PersonId == personId).Select(
                            c => new AccessAssignment()
                            {
                                AccessId = c.AccessId,
                                ExpiresAt = c.ExpiresAt,
                                Id = c.Id,
                                PersonId = c.PersonId,
                                Person = new Person()
                                {
                                    Id = c.PersonId,
                                    TeamId = a.TeamId,
                                    User = new User()
                                    {
                                        Name = c.Person.User.Name,
                                        Email = c.Person.User.Email,
                                    }
                                },
                            }
                        ).ToList()
                })
                .AsNoTracking().ToArrayAsync();

            return Json(assignedAccess);
        }

        public async Task<IActionResult> List(int teamId)
        {
            var accessList = await _context.Access
                .Where(x => x.Team.Id == teamId)
                .Include(x=> x.Assignments)
                .ThenInclude(x => x.Person)
                .ThenInclude(x => x.User)
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
                var accessAssingment = new AccessAssignment{
                    AccessId = accessId,
                    PersonId = personId,
                    ExpiresAt = DateTime.Parse(date),
                };
                accessAssingment.Person = await _context.People.Include(p => p.User).SingleAsync(p => p.Id == personId);
                _context.AccessAssignments.Add(accessAssingment);
                await _context.SaveChangesAsync();
                await _eventService.TrackAssignAccess(accessAssingment, Team);
                return Json(accessAssingment);
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