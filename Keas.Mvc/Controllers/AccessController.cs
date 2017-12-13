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

        public async Task<IActionResult> ListAssigned(int id) {
            var accessAssignments = await _context.AccessAssignments.Where(x=>x.PersonId == id).Include(x=>x.Access).AsNoTracking().ToArrayAsync();

            return Json(accessAssignments);
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

        public async Task<IActionResult> Assign(int accessId, int personId)
        {
            // TODO Make sure user has permssion, make sure access exists, makes sure access is in this team
            if (ModelState.IsValid)
            {
                var accessassingment = new AccessAssignment{
                    AccessId = accessId,
                    PersonId = personId,
                    ExpiresAt = DateTime.UtcNow.AddYears(3)
                };
                _context.AccessAssignments.Add(accessassingment);
                await _context.SaveChangesAsync();
                return Json(accessassingment);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke([FromBody]AccessAssignment accessAssignment)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                _context.AccessAssignments.Remove(accessAssignment);
                await _context.SaveChangesAsync();
                return Json(accessAssignment);
            }
            return BadRequest(ModelState);
        }
    }
}