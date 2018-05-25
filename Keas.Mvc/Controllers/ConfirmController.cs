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
            var viewmodel = await MyStuffListModel.Create(_context, person);
            return View(viewmodel);
        }

        public async Task<IActionResult> Confirm()
        {
            var person = await _securityService.GetPerson(Team);
            var viewModel = await ConfirmListModel.Create(_context,person);
            if (viewModel.Equipment.Count == 0 && viewModel.Keys.Count==0)
            {
                Message = "You have no pending items to accept";
                RedirectToAction(nameof(MyStuff));
            }

            return View(viewModel);
        }

        
        public async Task<IActionResult> AcceptKey(int keyId)
        {
            var keyAssignment = await _context.Keys.Where(k => k.Id == keyId).Select(ka => ka.Assignment).FirstAsync();
            keyAssignment.IsConfirmed = true;
            keyAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(keyAssignment);
            await _context.SaveChangesAsync();
            var key = await _context.Keys.Where(k => k.KeyAssignmentId == keyAssignment.Id).FirstAsync();
            await _eventService.TrackAcceptKey(key);
            Message = "Key confirmed.";

            return RedirectToAction(nameof(MyStuff));
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

            return RedirectToAction(nameof(MyStuff));
        }

        public async Task<IActionResult> AcceptAll()
        {
            var person = await _securityService.GetPerson(Team);
            var viewModel = await ConfirmUpdateModel.Create(_context, person);
            if (viewModel.Equipment.Count == 0 && viewModel.Keys.Count == 0)
            {
                Message = "You have no pending items to accept";
                RedirectToAction(nameof(MyStuff));
            }

            foreach (var key in viewModel.Keys)
            {
                key.Assignment.IsConfirmed = true;
                key.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(key);
                await _eventService.TrackAcceptKey(key);
            }
            foreach (var equipment in viewModel.Equipment)
            {
                equipment.Assignment.IsConfirmed = true;
                equipment.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(equipment);
                await _eventService.TrackAcceptEquipment(equipment);
            }
            await _context.SaveChangesAsync();
            Message = "All keys and equipment confirmed!";
            return RedirectToAction(nameof(MyStuff));
        }
    }
}