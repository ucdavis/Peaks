using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class ConfirmController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;
        private readonly IEventService _eventService;

        public ConfirmController(ApplicationDbContext context, ISecurityService _securityService, IEventService _eventService)
        {
            _context = context;
            this._securityService = _securityService;
            this._eventService = _eventService;
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
            if (viewModel.Equipment.Count == 0 && viewModel.Serials.Count==0 && viewModel.Workstations.Count==0)
            {
                Message = "You have no pending items to accept";
                return RedirectToAction(nameof(MyStuff));
            }

            return View(viewModel);
        }

        
        public async Task<IActionResult> AcceptKey(int serialId)
        {
            var keyAssignment =
                await _context.Serials.Where(s => s.Id == serialId).Select(sa => sa.Assignment).FirstAsync();
            keyAssignment.IsConfirmed = true;
            keyAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(keyAssignment);
            await _context.SaveChangesAsync();
            var serial = await _context.Serials.Where(s => s.KeyAssignmentId == keyAssignment.Id).Include(s=> s.Key).FirstAsync();
            await _eventService.TrackAcceptKey(serial);
            Message = "Key confirmed.";

            return RedirectToAction(nameof(Confirm));
        }

        public async Task<IActionResult> AcceptWorkstation(int workstationId)
        {
            var workstationAssignment = await _context.Workstations.Where(w => w.Id == workstationId)
                .Select(wa => wa.Assignment).FirstAsync();
            workstationAssignment.IsConfirmed = true;
            workstationAssignment.ConfirmedAt = DateTime.UtcNow;;
            _context.Update(workstationAssignment);
            await _context.SaveChangesAsync();

            var workstation = await _context.Workstations
                .Where(w => w.WorkstationAssignmentId == workstationAssignment.Id).FirstAsync();
            await _eventService.TrackAcceptWorkstation(workstation);
            Message = "Workstation confirmed.";

            return RedirectToAction(nameof(Confirm));

        }

        public async Task<IActionResult> AcceptEquipment(int equipmentId)
        {
            var equipmentAssignment = await 
                _context.Equipment.Where(e => e.Id == equipmentId).Select(eq => eq.Assignment).FirstAsync();
            equipmentAssignment.IsConfirmed = true;
            equipmentAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(equipmentAssignment);
            await _context.SaveChangesAsync();

            var equipment = await _context.Equipment.Where(e => e.EquipmentAssignmentId == equipmentAssignment.Id)
                .FirstAsync();
            await _eventService.TrackAcceptEquipment(equipment);
            Message = "Equipment confirmed.";

            return RedirectToAction(nameof(Confirm));
        }

        public async Task<IActionResult> AcceptAll()
        {
            var person = await _securityService.GetPerson(Team);
            var viewModel = await ConfirmUpdateModel.Create(_context, person);
            if (viewModel.Equipment.Count == 0 && viewModel.Serials.Count == 0)
            {
                Message = "You have no pending items to accept";
                return RedirectToAction(nameof(MyStuff));
            }

            foreach (var serial in viewModel.Serials)
            {
                serial.Assignment.IsConfirmed = true;
                serial.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(serial);
                await _eventService.TrackAcceptKey(serial);
            }
            foreach (var equipment in viewModel.Equipment)
            {
                equipment.Assignment.IsConfirmed = true;
                equipment.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(equipment);
                await _eventService.TrackAcceptEquipment(equipment);
            }
            foreach (var workstation in viewModel.Workstations)
            {
                workstation.Assignment.IsConfirmed = true;
                workstation.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(workstation);
                await _eventService.TrackAcceptWorkstation(workstation);
            }
            await _context.SaveChangesAsync();
            Message = "All keys and equipment confirmed!";
            return RedirectToAction(nameof(MyStuff));
        }
    }
}