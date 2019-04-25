using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;

namespace Keas.Mvc.Controllers
{
   [Authorize(Policy = AccessCodes.Codes.AnyRole)]
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
            var team = await _context.Teams.SingleOrDefaultAsync(x=>x.Slug == Team);

            if (team == null) {
                return NotFound();
            }

            var permissionNames = await _securityService.GetUserRoleNamesInTeamOrAdmin(team.Slug);
 
            var model = new AssetModel { Team = team, Permissions = permissionNames };

            return View(model);
        }

        
    }
}
