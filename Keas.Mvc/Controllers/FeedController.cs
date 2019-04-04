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
             _context = context;
             _reportService = reportService;
         }
        public async Task<IActionResult> TeamFeed(Guid id, string includeSpace)
        {            
             var validKey = await _context.Teams.Where(t => t.Slug == Team && t.ApiCode != null && t.ApiCode == id).AnyAsync();

            if(!validKey){
               return Unauthorized();
            }   

            if(includeSpace != null && includeSpace.Equals("yes", StringComparison.OrdinalIgnoreCase))
            {
                var people = _reportService.GetPeopleFeedIncludeSpace(Team);
                return Json(people);
            } else
            {
                var people = _reportService.GetPeopleFeed(Team);
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

    }
}
