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
using Keas.Mvc.Services;

namespace Keas.Mvc.Controllers
{
    [AllowAnonymous]
    public class FeedController : SuperController
    {
         private readonly ApplicationDbContext _context;
         private readonly IReportService _reportService;

         public FeedController(ApplicationDbContext context, IReportService reportService)
         {
             this._context = context;
             _reportService = reportService;
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

        public async Task<IActionResult> WorkstationFeed(Guid id)
        {
            var validKey = await _context.Teams.Where(t => t.Slug == Team && t.ApiCode != null && t.ApiCode == id).AnyAsync();

            if (!validKey)
            {
                return Unauthorized();
            }

            return Json(await _reportService.WorkStations(null, Team));
        }

        private async Task<List<FeedPeopleModel>> GetPeopleFeed()
        {
            var people = await _context.People
                .Where(x=> x.Team.Slug == Team && x.Active)
                .Select(p => new FeedPeopleModel
                {
                FirstName = p.FirstName,
                LastName = p.LastName,
                Name = p.Name,
                Email = p.Email,
                UserId = p.UserId,
                Title = p.Title,
                TeamPhone = p.TeamPhone,
                Tags = p.Tags
                })                              
                .ToListAsync();

                return people;
        }

        private List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace()
        {
            var people = _context.People
                .Where(x=> x.Team.Slug == Team && x.Active)
                .Select(p => new FeedPeopleSpaceModel {
                FirstName = p.FirstName,
                LastName = p.LastName,
                Name = p.Name,
                Email = p.Email,
                UserId = p.UserId,
                Title = p.Title,
                TeamPhone = p.TeamPhone,
                Tags = p.Tags,
                Workstations = ( from w in _context.Workstations where w.Assignment.PersonId == p.Id select w)
                    .Include(w => w.Space)
                    .Select(w => new FeedWorkstation {
                        Name = w.Name,
                        BldgName = w.Space.BldgName,
                        RoomNumber = w.Space.RoomNumber
                    }).ToList()
                })
                .ToList();

                return people;
        }

    }
}
