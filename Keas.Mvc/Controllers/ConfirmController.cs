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

            return View(viewModel);
        }
    }
}