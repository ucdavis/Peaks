using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class WorkstationController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public WorkstationController(ApplicationDbContext context, IEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var workstation = await _context.Workstations
                .Where(w => w.Team.Name == Team && w.Active && w.Assignment == null && w.Name.StartsWith(q, comparison))
                .AsNoTracking().ToListAsync();

            return Json(workstation);
        }

        public async Task<IActionResult> GetWorkstationInRoom(string roomKey)
        {
            var workstation = await _context.Workstations.Where(x => x.Space.RoomKey == roomKey).AsNoTracking()
                .ToListAsync();
            return Json(workstation);
        }

        public async Task<IActionResult> CommonAttributeKeys()
        {
            var keys = await _context.WorkstationAttributes
                .Where(w => w.Workstation.Team.Name == Team)
                .GroupBy(w => w.Key)
                .Take(5)
                .OrderByDescending(w => w.Count())
                .Select(w => w.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        public async Task<IActionResult> ListAssigned(int personId)
        {
            var workstationAssignments = await _context.Workstations
                .Where(w => w.Assignment.PersonId == personId)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person.User)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstationAssignments);
        }

        public async Task<IActionResult> List()
        {
            var workstations = await _context.Workstations
                .Where(w => w.Team.Name == Team)
                .Include(w => w.Assignment)
                .ThenInclude(w => w.Person.User)
                .Include(w => w.Space)
                .Include(w => w.Attributes)
                .Include(w => w.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(workstations);
        }


    }
}