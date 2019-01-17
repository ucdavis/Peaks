using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Domain;

namespace Keas.Mvc.Controllers
{
    public class FeedController : SuperController
    {
         private readonly ApplicationDbContext _context;

        public FeedController(ApplicationDbContext context)
        {
            this._context = context;
        }
        public async Task<IActionResult> TeamFeed(Guid id, string space)
        {            
            if(space == "yes")
            {
                var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active && x.Team.ApiCode == id)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags,
                workstation = (from w in _context.Workstations where w.Assignment.PersonId == p.Id select w)
                    .Include(w => w.Space)
                    .Select(w => new {w.Name, w.Space.BldgName, w.Space.RoomNumber})
                })
                .ToListAsync();
                return Json(people);
            } else
            {
                var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active && x.Team.ApiCode == id)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags})
                .ToListAsync();
                return Json(people);
            }  
        } 
    }
}