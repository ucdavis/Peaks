using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
   [Authorize(Policy = "AnyRole")]
    public class AssetController : SuperController
    {
       
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;

        public AssetController(ApplicationDbContext context, ISecurityService securityService)
        {
            this._context = context;
            this._securityService = securityService;
        }

        // List out all assets for team
        public async Task<IActionResult> Index() {
            var team = await _context.Teams.SingleOrDefaultAsync(x=>x.Name == Team);

            if (team == null) {
                return NotFound();
            }

            var permissions = await _securityService.GetUserRolesInTeamOrAdmin(team);

            var permissionNames = permissions.Select(p => p.Name).ToArray();
 
            var model = new AssetModel { Team = team, Permissions = permissionNames };

            return View(model);
        }

        
    }
}