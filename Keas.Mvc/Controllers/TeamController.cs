using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.SystemAdminAccess)]
    public class TeamController : Controller
    {
        private readonly ApplicationDbContext _context;

        public TeamController(ApplicationDbContext context)
        {
            _context = context;
        }



        // GET: Team/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Team/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<IActionResult> Create([Bind("Id,Name,Slug")] Team team)
        {
            if (await _context.Teams.AnyAsync(a => a.Slug == team.Slug))
            {
                ModelState.AddModelError("Slug", "Team Slug already used.");
            }

            if (ModelState.IsValid)
            {
                _context.Add(team);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index","Admin");
            }
            return View(team);
        }

        // GET: Team/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var team = await _context.Teams.SingleOrDefaultAsync(m => m.Id == id);
            if (team == null)
            {
                return NotFound();
            }
            return View(team);
        }

        // POST: Team/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // Updated as per MS docs https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/crud
        [HttpPost]
        public async Task<IActionResult> Edit(int id, Team team)
        {
            if (id != team.Id)
            {
                return NotFound();
            }

            if (await _context.Teams.AnyAsync(a => a.Id != team.Id && a.Slug == team.Slug))
            {
                ModelState.AddModelError("Slug", "Team Slug already used.");
            }

            if (!ModelState.IsValid)
            {
                return View(team);
            }
            var teamToUpdate = await _context.Teams.SingleOrDefaultAsync(x => x.Id == id);
            if (await TryUpdateModelAsync<Team>(teamToUpdate, "", t => t.Name, t=> t.Slug))
            {
                try
                {
                    await _context.SaveChangesAsync();
                    return RedirectToAction("Index","Admin");
                }
                catch
                {
                    ModelState.AddModelError("","Unable to save changes.");
                }
            }
            return View(team);
        }


        private bool TeamExists(int id)
        {
            return _context.Teams.Any(e => e.Id == id);
        }
    }
}
