using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

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

        public async Task<IActionResult> AcceptKey(int keyid)
        {
            var keyAssignment = _context.Keys.Where(k => k.Id == keyid).Select(ka => ka.Assignment).First();
            keyAssignment.IsConfirmed = true;
            keyAssignment.ConfirmedAt = DateTime.UtcNow;
            _context.Update(keyAssignment);

            return RedirectToAction(nameof(Index));
        }
    }
}