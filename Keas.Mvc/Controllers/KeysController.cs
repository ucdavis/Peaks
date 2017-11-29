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
    public class KeysController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public KeysController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> ListAssigned(int id) {
            var keyAssignments = await _context.KeyAssignments.Where(x=>x.PersonId == id).Include(x=>x.Key).AsNoTracking().ToArrayAsync();

            return Json(keyAssignments);
        }
        public async Task<IActionResult> Create(Key key)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                _context.Keys.Add(key);
                await _context.SaveChangesAsync();
            }
            return Json(key);
        }

        public async Task<IActionResult> Assign(int keyId, int personId)
        {
            // TODO Make sure user has permssion, make sure key exists, makes sure key is in this team
            if (ModelState.IsValid)
            {
                var keyassingment = new KeyAssignment{ KeyId = keyId, PersonId = personId};
                _context.KeyAssignments.Add(keyassingment);
                await _context.SaveChangesAsync();
                return Json(keyassingment);
            }
            return BadRequest(ModelState);
        }

    }
}