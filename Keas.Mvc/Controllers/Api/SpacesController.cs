using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    public class SpacesController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public SpacesController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public async Task<IActionResult> SearchSpaces(string q)
        {
            var orgIds = await _context.FISOrgs.Where(f => f.Team.Slug == Team).Select(x => x.OrgCode).Distinct().ToListAsync();
            var queryWords = q.ToLower().Split(" ").ToList();
            var space = await _context.Spaces
                .Where(x => orgIds.Contains(x.OrgId) && ((!string.IsNullOrWhiteSpace(x.BldgName) && queryWords.Any(s => x.BldgName.ToLower().Contains(s)))
                || (!string.IsNullOrWhiteSpace(x.RoomName) && queryWords.Any(s => x.RoomName.ToLower().Contains(s)))
                || (!string.IsNullOrWhiteSpace(x.RoomNumber) && queryWords.Any(s => x.RoomNumber.ToLower().Contains(s)))))
                .AsNoTracking().ToListAsync();
            return Json(space);
        }

        public async Task<IActionResult> List()
        {
            //TODO clean up workstations query
            var orgIds = await _context.FISOrgs.Where(f => f.Team.Slug == Team).Select(x => x.OrgCode).Distinct().ToListAsync();
            var spaces =
                from space in _context.Spaces.Where(x => orgIds.Contains(x.OrgId))
                select new
                {
                    space = space,
                    id = space.Id,
                    equipmentCount =
                        (from eq in _context.Equipment where eq.SpaceId == space.Id && eq.Active select eq).Count(),
                    keyCount =
                        (from k in _context.KeyXSpaces where k.SpaceId == space.Id && k.Key.Active select k.Key).Count(),
                    workstationsTotal =
                        (from w in _context.Workstations where w.SpaceId == space.Id && w.Active select w).Count(),
                    workstationsInUse =
                        (from w in _context.Workstations where w.SpaceId == space.Id && w.Active && w.Assignment != null select w).Count(),
                    tags =
                        string.Join(",",
                        (from w in _context.Workstations
                         where w.SpaceId == space.Id && w.Active && !string.IsNullOrWhiteSpace(w.Tags)
                         select w.Tags).ToArray()),
                };
            return Json(await spaces.ToListAsync());
        }

        public async Task<IActionResult> GetTagsInSpace(int spaceId)
        {
            var tags = await _context.Workstations.Where(x => x.Active && x.SpaceId == spaceId && !string.IsNullOrWhiteSpace(x.Tags)).Select(x => x.Tags).ToArrayAsync();
            return Json(string.Join(",", tags));
        }

        public async Task<IActionResult> Details(int id)
        {
            var space = await _context.Spaces
                .Where(w => w.Active && w.Id == id)
                .AsNoTracking()
                .SingleOrDefaultAsync();
            return Json(space);
        }
    }
}