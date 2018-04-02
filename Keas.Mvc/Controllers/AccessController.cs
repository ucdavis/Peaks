using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class AccessController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public AccessController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> Search(int teamId, string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var access = await _context.Access.Include(x => x.Assignments)
                .Where(x => x.Team.Id == teamId && x.Active &&
                (x.Name.StartsWith(q, comparison))) //|| x.SerialNumber.StartsWith(q, comparison)))
                .AsNoTracking().ToListAsync();

            return Json(access);
        }

        public async Task<IActionResult> ListAssigned(int id, int teamId) {
            var assignedAccess = await _context.Access 
                .Where(x => x.TeamId == teamId && x.Assignments.Any(a => a.PersonId == id))
                .Include(x => x.Assignments)
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
            }
            return Json(access);
        }

        public async Task<IActionResult> Assign(int accessId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure access exists, makes sure access is in this team
            if (ModelState.IsValid)
            {
                var access = await _context.Access.Include(x => x.Assignments).ThenInclude(x => x.Person.User).SingleAsync(x => x.Id == accessId);
                var person = await _context.People.Include(x => x.User).SingleAsync(x => x.Id == personId);
                var accessAssingment = new AccessAssignment{
                    AccessId = accessId,
                    Person = person,
                    PersonId = personId,
                    ExpiresAt = DateTime.Parse(date),
                };
                access.Assignments.Add(accessAssingment);
                _context.AccessAssignments.Add(accessAssingment);
                await _context.SaveChangesAsync();
                return Json(access);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke(int accessId, int personId)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var access = await _context.Access.Include(x => x.Assignments).SingleAsync(x => x.Id == accessId);
                var accessAssignment = access.Assignments.Single(x => x.PersonId == personId);
                access.Assignments.Remove(accessAssignment);
                _context.AccessAssignments.Remove(accessAssignment);
                await _context.SaveChangesAsync();
                return Json(access);
            }
            return BadRequest(ModelState);
        }
    }
}