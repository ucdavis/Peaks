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

        public ConfirmController(ApplicationDbContext context, ISecurityService _securityService)
        {
            _context = context;
            this._securityService = _securityService;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _securityService.GetUser();
            var viewModel = await ConfirmListModel.Create(Team, _context, user);
            if (viewModel.Equipment.Count == 0 && viewModel.Keys.Count==0)
            {
                Message = "You have no pending items to accept";
                // TODO Find good place to redirect to. Ignores redirects to non-async actionresults.
                RedirectToAction("Index", "Home");
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

            Message = "Key confirmed.";

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> AcceptEquipment(int equipmentId)
        {
            var equipmentAssignment = await 
                _context.Equipment.Where(e => e.Id == equipmentId).Select(eq => eq.Assignment).FirstAsync();
            equipmentAssignment.IsConfirmed = true;
            equipmentAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(equipmentAssignment);
            await _context.SaveChangesAsync();

            Message = "Equipment confirmed.";

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> AcceptAll()
        {
            var user = await _securityService.GetUser();
            var viewModel = await ConfirmUpdateModel.Create(Team, _context, user);
            if (viewModel.Equipment.Count == 0 && viewModel.Keys.Count == 0)
            {
                Message = "You have no pending items to accept";
                // TODO Find good place to redirect to. Ignores redirects to non-async actionresults.
                RedirectToAction("Index", "Home");
            }

            foreach (var key in viewModel.Keys)
            {
                key.Assignment.IsConfirmed = true;
                key.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(key);
            }
            foreach (var equipment in viewModel.Equipment)
            {
                equipment.Assignment.IsConfirmed = true;
                equipment.Assignment.ConfirmedAt = DateTime.UtcNow;
                _context.Update(equipment);
            }
            await _context.SaveChangesAsync();
            Message = "All keys and equipment confirmed!";
            // TODO Find good place to redirect to. Ignores redirects to non-async actionresults.
            return RedirectToAction(nameof(Index));
        }
    }
}