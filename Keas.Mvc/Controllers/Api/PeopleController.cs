using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    public class PeopleController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public PeopleController(ApplicationDbContext context)
        {
            this._context = context;
        }

        public async Task<IActionResult> List()
        {
            var people = 
            from person in _context.People.Where(x => x.Team.Name == Team && x.Active).Include(x => x.User) // TODO: have some way to show inactive?
            select new
            {
                person = person,
                id = person.Id,
                accessCount = 
                    (from a in _context.AccessAssignments where a.PersonId == person.Id select a).Count(),
                equipmentCount = 
                    (from eq in _context.EquipmentAssignments where eq.PersonId == person.Id select eq ).Count(),
                keyCount = 
                    (from k in _context.KeyAssignments where k.PersonId == person.Id select k ).Count()
                };
            return Json(await people.ToListAsync());
        }

        public async Task<IActionResult> Search(string q)
        {
            var people = await _context.People
                .Where(x => x.Team.Name == Team && x.Active && x.User.Email.StartsWith(q))
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

        public async Task<IActionResult> GetPerson(int personId)
        {
            var person = await _context.People
                .Where(x => x.Team.Name == Team && x.Id == personId).Include(x => x.User).AsNoTracking().SingleAsync();
            return Json(person);
        }

        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Histories.Where(x => x.TargetId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(5).AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}