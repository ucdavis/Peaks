using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class PeopleController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public PeopleController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Get all people who are part of a team
            var people = await _context.People.Where(x => x.Team.Name == Team && x.Active).AsNoTracking().ToListAsync();

            return Json(people);
        }

        public async Task<IActionResult> Search(int teamId, string q)
        {
            var people = await _context.People
                .Where(x => x.Team.Id == teamId && x.Active && x.User.Email.StartsWith(q))
                .Include(x => x.User).AsNoTracking().ToListAsync();

            return Json(people);
        }

        public async Task<IActionResult> Details(int? id)
        {
            Person person;

            if (id.HasValue)
            {
                person = await _context.People.Where(x => x.Team.Name == Team && x.Id == id.Value).Include(x => x.User).AsNoTracking().SingleAsync();
            }
            else
            {
                person = new Person();
            }

            return View(person);
        }
    }
}