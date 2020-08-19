using Keas.Core.Data;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

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
            var validKey = await _context.Teams.Include(a => a.TeamApiCode).Where(t => t.Slug == Team && t.TeamApiCode != null && t.TeamApiCode.ApiCode == id).AnyAsync();

            if(!validKey){
               return Unauthorized();
            }   

            if(includeSpace != null && includeSpace.Equals("yes", StringComparison.OrdinalIgnoreCase))
            {
                var people = _reportService.GetPeopleFeedIncludeSpace(Team);
                return Json(people);
            } else
            {
                var people = await _reportService.GetPeopleFeed(Team);
                return Json(people);
            }  
        }

        public async Task<IActionResult> WorkstationFeed(Guid id)
        {
            var validKey = await _context.Teams.Include(a => a.TeamApiCode).Where(t => t.Slug == Team && t.TeamApiCode != null && t.TeamApiCode.ApiCode == id).AnyAsync();

            if (!validKey)
            {
                return Unauthorized();
            }

            return Json(await _reportService.WorkStations(null, Team));
        }

        public async Task<IActionResult> EquipmentFeed(Guid id)
        {
            var validKey = await _context.Teams.Include(a => a.TeamApiCode).Where(t => t.Slug == Team && t.TeamApiCode != null && t.TeamApiCode.ApiCode == id).AnyAsync();

            if (!validKey)
            {
                return Unauthorized();
            }

            return Json(await _reportService.EquipmentList(null, Team, false));
        }

        public async Task<IActionResult> AccessFeed(Guid id)
        {
            var validKey = await _context.Teams.Include(a => a.TeamApiCode).Where(t => t.Slug == Team && t.TeamApiCode != null && t.TeamApiCode.ApiCode == id).AnyAsync();

            if (!validKey)
            {
                return Unauthorized();
            }

            return Json(await _reportService.AccessList(null, Team));
        }

        public async Task<IActionResult> KeyFeed(Guid id)
        {
            var validKey = await _context.Teams.Include(a => a.TeamApiCode).Where(t => t.Slug == Team && t.TeamApiCode != null && t.TeamApiCode.ApiCode == id).AnyAsync();

            if (!validKey)
            {
                return Unauthorized();
            }

            return Json(await _reportService.Keys(null, Team));
        }

    }
}
