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
    [AllowAnonymous]
    public class FeedController : SuperController
    {
         private readonly ApplicationDbContext _context;

        public FeedController(ApplicationDbContext context)
        {
            this._context = context;
        }
        public async Task<IActionResult> TeamFeed(Guid id, string includeSpace)
        {            
             var validKey = await _context.Teams.Where(t => t.Slug == Team && t.ApiCode != null && t.ApiCode == id).AnyAsync();

            if(!validKey){
               return Unauthorized();
            }   

            if(includeSpace == "yes")
            {
                var people = GetPeopleFeedIncludeSpace();
                return Json(people);
            } else
            {
                var people = GetPeopleFeed();
                return Json(people);
            }  
        } 

        private async Task<Array> GetPeopleFeed()
        {
            var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags})                
                .ToArrayAsync();

                return people;
        }

        private async Task<Array> GetPeopleFeedIncludeSpace()
        {
            var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active)
                .Select(p => new {p.Name, p.FirstName, p.LastName, p.Email, p.UserId, p.Title, p.TeamPhone, p.Tags,
                workstation = (from w in _context.Workstations where w.Assignment.PersonId == p.Id select w)
                    .Include(w => w.Space)
                    .Select(w => new {w.Name, w.Space.BldgName, w.Space.RoomNumber})
                })
                .ToArrayAsync();

                return people;
        }

    }
}