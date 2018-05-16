using Keas.Core.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
   // [Authorize(Policy = "AnyRole")]
    public class AssetController : SuperController
    {
        // TODO Decorate with security policy? Dept Admin? Any role? When I tried, I created a Json loop with Team & Teampermission!
        private readonly ApplicationDbContext _context;

        public AssetController(ApplicationDbContext context)
        {
            this._context = context;
        }

        // List out all assets for team
        public async Task<IActionResult> Index() {
            var team = await _context.Teams.SingleOrDefaultAsync(x=>x.Name == Team);

            if (team == null) {
                return NotFound();
            }

            return View(team);
        }
    }
}