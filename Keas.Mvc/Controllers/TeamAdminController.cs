using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
    public class TeamAdminController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public TeamAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Members()
        {
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=>tp.TeamRole)
                .SingleOrDefaultAsync(x => x.Name == Team);
            
            if (team == null)
            {
                return NotFound();
            }
            var viewModel = TeamAdminMembersListModel.Create(team);
            return View(viewModel);
        }
  
        
    }
}