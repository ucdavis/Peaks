using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class GroupController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public GroupController(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IActionResult> Index(int id)
        {
            var group = await _context.Groups.SingleOrDefaultAsync(a =>
                a.Id == id && a.GroupPermissions.Any(w => w.UserId == User.Identity.Name));

            if (group == null)
            {
                ErrorMessage = "Group not found or no access to Group";
                return RedirectToAction("NoAccess", "Home");
            }

            return View(group);
        }
    }
}
