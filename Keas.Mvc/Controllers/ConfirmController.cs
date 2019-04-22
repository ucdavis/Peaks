using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Helper;

namespace Keas.Mvc.Controllers
{
    public class ConfirmController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;
        private readonly IEventService _eventService;
        private readonly IRolesSessionsManager _rolesSessionsManager;

        public ConfirmController(ApplicationDbContext context, ISecurityService _securityService, IEventService _eventService, IRolesSessionsManager rolesSessionsManager)
        {
            _context = context;
            this._securityService = _securityService;
            this._eventService = _eventService;
            _rolesSessionsManager = rolesSessionsManager;
        }

        public IActionResult RefreshPermissions()
        {
            _rolesSessionsManager.ClearSessionRoles();
            return RedirectToAction("SelectTeam");
        }

        public async Task<IActionResult> MyStuff()
        {   
            var person = await _securityService.GetPerson(Team);
            if(person == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }
            var viewmodel = await MyStuffListModel.Create(_context, person);
            return View(viewmodel);
        }

        public async Task<IActionResult> Confirm()
        {           
            var person = await _securityService.GetPerson(Team);
            if(person == null){
                 Message = "You are not yet added to the system.";
                return RedirectToAction("NoAccess","Home");
            }
            var viewModel = await ConfirmListModel.Create(_context,person);
            if (viewModel.Equipment.Count == 0 && viewModel.KeySerials.Count==0 && viewModel.Workstations.Count==0)
            {
                Message = "You have no pending items to accept";
                return RedirectToAction(nameof(MyStuff));
            }

            return View(viewModel);
        }

        
        public async Task<IActionResult> AcceptKey(int serialId)
        {
            var keyAssignment =
                await _context.KeySerials.Where(s => s.Id == serialId).Select(sa => sa.KeySerialAssignment).FirstAsync();
            keyAssignment.IsConfirmed = true;
            keyAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(keyAssignment);
            
            var serial = await _context.KeySerials.Where(s => s.KeySerialAssignmentId == keyAssignment.Id).Include(s=> s.Key).FirstAsync();
            await _eventService.TrackAcceptKeySerial(serial);
            Message = "Key confirmed.";
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Confirm));
        }

        public async Task<IActionResult> AcceptWorkstation(int workstationId)
        {
            var workstationAssignment = await _context.Workstations.Where(w => w.Id == workstationId)
                .Select(wa => wa.Assignment).FirstAsync();
            workstationAssignment.IsConfirmed = true;
            workstationAssignment.ConfirmedAt = DateTime.UtcNow;;
            _context.Update(workstationAssignment);
            

            var workstation = await _context.Workstations.Include(a => a.Space)
                .Where(w => w.WorkstationAssignmentId == workstationAssignment.Id).FirstAsync();
            await _eventService.TrackAcceptWorkstation(workstation);
            Message = "Workstation confirmed.";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Confirm));

        }

        public async Task<IActionResult> AcceptEquipment(int equipmentId)
        {
            var equipmentAssignment = await 
                _context.Equipment.Where(e => e.Id == equipmentId).Select(eq => eq.Assignment).FirstAsync();
            equipmentAssignment.IsConfirmed = true;
            equipmentAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(equipmentAssignment);
           

            var equipment = await _context.Equipment.Where(e => e.EquipmentAssignmentId == equipmentAssignment.Id)
                .FirstAsync();
            await _eventService.TrackAcceptEquipment(equipment);
            Message = "Equipment confirmed.";
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Confirm));
        }

        public async Task<IActionResult> AcceptAll()
        {
            var person = await _securityService.GetPerson(Team);
            var viewModel = await ConfirmUpdateModel.Create(_context, person);
            if (viewModel.Equipment.Count == 0 && viewModel.KeySerials.Count == 0 && viewModel.Workstations.Count == 0)
            {
                Message = "You have no pending items to accept";
                return RedirectToAction(nameof(MyStuff));
            }

            var extendedMessage = string.Empty;

            foreach (var serial in viewModel.KeySerials)
            {
                serial.KeySerialAssignment.IsConfirmed = true;
                serial.KeySerialAssignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(serial);
                await _eventService.TrackAcceptKeySerial(serial);
                extendedMessage = "keys";
            }
            foreach (var equipment in viewModel.Equipment)
            {
                equipment.Assignment.IsConfirmed = true;
                equipment.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(equipment);
                await _eventService.TrackAcceptEquipment(equipment);
                if(string.IsNullOrWhiteSpace(extendedMessage))
                {
                    extendedMessage = "equipment items";
                }
                else
                {
                    extendedMessage = $"{extendedMessage} and equipment items";
                }
            }
            foreach (var workstation in viewModel.Workstations)
            {
                workstation.Assignment.IsConfirmed = true;
                workstation.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(workstation);
                await _eventService.TrackAcceptWorkstation(workstation);
                if(string.IsNullOrWhiteSpace(extendedMessage))
                {
                    extendedMessage = "workstations";
                }
                else
                {
                    extendedMessage = $"{extendedMessage} and workstations";
                }
            }
            await _context.SaveChangesAsync();
            Message = $"All {extendedMessage} have been confirmed!";
            return RedirectToAction(nameof(MyStuff));
        }

        public async Task<IActionResult> SelectTeam(string urlRedirect) {
            var user = await _securityService.GetUser();
            if (user == null) 
            {
                return RedirectToAction("NoAccess","Home");
            }
            var people = await _context.People.Where(p => p.User == user).Select(a => a.Team).AsNoTracking().ToArrayAsync();
            var teamAdmins = await _context.TeamPermissions.Where(tp => tp.User == user).Select(a => a.Team).AsNoTracking().ToArrayAsync();
            var teams = people.Union(teamAdmins, new TeamComparer());
            if(teams.Count() == 0){
                return Redirect("/Home/NoAccess/");
            }
            if (teams.Count() == 1) {
                if(!string.IsNullOrWhiteSpace(urlRedirect)){
                    return Redirect("/" + teams.First().Slug + "/" + urlRedirect);
                } else {
                    return Redirect("/" + teams.First().Slug + "/Confirm/MyStuff");
                }
            }
            
            ViewBag.urlRedirect = urlRedirect == null ? "Confirm/Mystuff/" : urlRedirect;
            return View(teams);
        }
    }
}
