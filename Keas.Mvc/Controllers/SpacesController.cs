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
            q = q.ToLower();
            var room = await _context.Rooms
                .Where(x => (x.BldgName.ToLower().Contains(q)
                || x.RoomName.ToLower().Contains(q) 
                || x.RoomNumber.ToLower().Contains(q)))
                .AsNoTracking().ToListAsync();
            return Json(room);
        }
    }
}