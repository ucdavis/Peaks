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
    public class SpacesController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public SpacesController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public async Task<IActionResult> SearchRooms(string q)
        {
            var queryWords = q.ToLower().Split(" ").ToList();
            var room = await _context.Rooms
                .Where(x => (!String.IsNullOrWhiteSpace(x.BldgName) && queryWords.Any(s => x.BldgName.ToLower().Contains(s)))
                || (!String.IsNullOrWhiteSpace(x.RoomName) && queryWords.Any(s => x.RoomName.ToLower().Contains(s)))
                || (!String.IsNullOrWhiteSpace(x.RoomNumber) && queryWords.Any(s => x.RoomNumber.ToLower().Contains(s))))
                .AsNoTracking().ToListAsync();
            return Json(room);
        }

        public async Task<IActionResult> List(string orgId)
        {
            var spaces = await _context.Spaces
                .Where(x => x.OrgId == orgId)
                .Include(x => x.Room).AsNoTracking().ToListAsync();
            return Json(spaces);
        }

        public async Task<IActionResult> GetSpaceDetails(string id)
        {
            var equipment = await _context.Equipment.Where(x => x.Room.RoomKey == id).AsNoTracking().ToListAsync();
            return Json(equipment);
        }

    }
}