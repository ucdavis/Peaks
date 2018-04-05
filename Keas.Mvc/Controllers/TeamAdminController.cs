using System;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Keas.Mvc.Controllers
{
    public class TeamAdminController : SuperController
    {
        // TODO: Authorize to appropriate roles. Maybe just require DA?

        private readonly ApplicationDbContext _context;

        public TeamAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> RoledMembers()
        {
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=>tp.TeamRole)
                .SingleAsync(x => x.Name == Team);
            
            var viewModel = TeamAdminMembersListModel.Create(team);
            return View(viewModel);
        }

        public async Task<IActionResult> AddMemberRole()
        {
            var team = await _context.Teams.SingleAsync(x => x.Name == Team);
            
            var viewModel = TeamAdminMembersAddModel.Create(team, _context);
            return View(viewModel);
        }


        public async Task<IActionResult> BulkImportMembers()
        {
            //TODO: Import from IAM using FIS Org code => PPS Dept ID => IAM bulk load call
            throw new NotImplementedException();
        }



    }
}