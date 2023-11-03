using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Helper;
using Microsoft.AspNetCore.Authorization;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class SupervisorController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;
        private readonly ITeamsManager _teamsManager;


        public SupervisorController(ApplicationDbContext context, ISecurityService _securityService, IEventService _eventService, ITeamsManager teamsManager)
        {
            _context = context;
            this._securityService = _securityService;
            _teamsManager = teamsManager;
        }

        public IActionResult RefreshPermissions()
        {
            _teamsManager.ClearTeams();
            return RedirectToAction("SelectTeam");
        }

        public async Task<IActionResult> MyStaff()
        {   
            var person = await _securityService.GetPerson(Team);
            if(person == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }
            var viewmodel = await MyStaffListModel.Create(_context, person);

            return View(viewmodel);
        }

        public async Task<IActionResult> StaffStuff(int id) // id of staff being viewed
        {   
            var supervisor = await _securityService.GetPerson(Team);
            if(supervisor == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }
            var underling = await _context.People.Include(p=> p.Team).FirstOrDefaultAsync(p=> p.Id==id && p.SupervisorId == supervisor.Id);
            if(underling == null){
                return RedirectToAction("AccessDenied","Account"); // is this the best way to do this? -river
            }
            var viewmodel = await MyStaffListItem.Create(_context, underling);

            return View(viewmodel);
        }

    }
}
