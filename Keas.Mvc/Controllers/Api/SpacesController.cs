using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Dapper;
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
            var orgIds = await _context.FISOrgs.Where(f => f.Team.Slug == Team).Select(x => x.OrgCode).Distinct().ToArrayAsync();
            
            // TODO: filter by ORGIDs
            var sql = @"select Space.*,
       Space.Id              as Id,
       EquipmentCount,
       COALESCE(KeyCount, 0) as KeyCount,
       WorkstationsTotalCount,
       WorkstationsInUseCount,
       COALESCE(WorkstationTags, '') as tags
from (select Space.Id, count(Equipment.Id) as EquipmentCount
      from Spaces Space
             left join Equipment on Space.Id = Equipment.SpaceId and Equipment.Active = 1
      group by Space.Id) t1
       left outer join (select Space.Id, count(KeyXSpaces.Id) as KeyCount
                        from Spaces Space
                               left join KeyXSpaces on Space.Id = KeyXSpaces.SpaceId
                               inner join Keys K on KeyXSpaces.KeyId = K.Id and K.Active = 1
                        group by Space.Id) t3 on t1.Id = t3.Id
       left outer join (select Space.Id, count(W.Id) as WorkstationsTotalCount, STRING_AGG(Tags, ',') as WorkstationTags
                        from Spaces Space
                               left join Workstations W on Space.Id = W.SpaceId and W.Active = 1
                        group by Space.Id) t2 on t1.Id = t2.Id
       left outer join (select Space.Id, count(W.Id) as WorkstationsInUseCount
                        from Spaces Space
                               left join Workstations W
                                 on Space.Id = W.SpaceId and W.Active = 1 and W.WorkstationAssignmentId is not null
                        group by Space.Id) t4 on t1.Id = t4.Id
       inner join Spaces Space on Space.Id = t1.Id
       where Space.OrgId in (@orgIds);";

            var result = await _context.Database.GetDbConnection().QueryAsync(sql, new { orgIds });

            var spaces = result.Select(r => new {
                space = new {
                    id = r.Id,
                    deptKey = r.DeptKey,
                    deptName = r.DeptName,
                    bldgKey = r.BldgKey,
                    bldgName = r.BldgName,
                    roomKey = r.RoomKey,
                    roomNumber = r.RoomNumber,
                    roomName = r.RoomName,
                    floorKey = r.FloorKey,
                    floorName = r.FloorName,
                    roomCategoryName = r.RoomCategoryName,
                    roomCategoryCode = r.RoomCategoryCode,
                    chartNum = r.ChartNum,
                    orgId = r.OrgId,
                    source = r.Source,
                    active = r.Active
                },
                id = r.Id,
                equipmentCount = r.EquipmentCount,
                keyCount = r.KeyCount,
                workstationsTotal = r.WorkstationsTotalCount,
                workstationsInUse = r.WorkstationsInUseCount,
                tags = r.Tags
            });

            return Json(spaces);
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