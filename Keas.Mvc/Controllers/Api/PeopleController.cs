using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    public class PeopleController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;

        public PeopleController(ApplicationDbContext context, IIdentityService identityService)
        {
            this._context = context;
            this._identityService = identityService;
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
                    (from a in _context.AccessAssignments where a.Person.Id == person.Id select a).Count(),
                equipmentCount = 
                    (from eq in _context.EquipmentAssignments where eq.PersonId == person.Id select eq ).Count(),
                keyCount = 
                    (from k in _context.KeyAssignments where k.PersonId == person.Id select k ).Count(),
                workstationCount = 
                    (from w in _context.WorkstationAssignments where w.PersonId == person.Id select w).Count()
                };
            return Json(await people.ToListAsync());
        }

        public async Task<IActionResult> Search(string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var people = await _context.People
                .Where(x => x.Team.Name == Team && x.Active && 
                (x.Email.IndexOf(q, comparison) >= 0 || x.Name.IndexOf(q, comparison) >= 0)) // case-insensitive version of .Contains
                .Include(x => x.User).AsNoTracking().ToListAsync();

            return Json(people);
        }

      public async Task<IActionResult> SearchUser(string searchTerm)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var users = await _context.Users.Where(x => x.Email.IndexOf(searchTerm, comparison) >= 0
                || x.Id.IndexOf(searchTerm, comparison) >= 0) //case-insensitive version of .Contains
                .AsNoTracking().FirstOrDefaultAsync();
            if (users==null)
            {
                if(searchTerm.Contains("@"))
                {
                    var user = await _identityService.GetByEmail(searchTerm);
                    return Json(user);
                }
                else
                {
                    var user = await _identityService.GetByKerberos(searchTerm);
                    return Json(user);
                }
            }
            return Json(users);
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

         public async Task<IActionResult> Create([FromBody] Person person)
        {
            // TODO Make sure user has permission; Protect from overpost
            if (ModelState.IsValid)
            {
                var existingPerson = await _context.People.SingleAsync( p => person.Team.Name == Team && p.UserId == person.UserId && !p.Active);
                // if this user already exists as a person, but isn't active
                if(existingPerson != null)
                {
                    existingPerson.Active = true;
                    await _context.SaveChangesAsync();
                    return Json(existingPerson);
                }
                var user = await _context.Users.SingleAsync(u => u.Id == person.UserId);
                // if this user already exists, but isn't a person
                if(user != null)
                {
                    person.User = user;
                }
                _context.People.Add(person);
                await _context.SaveChangesAsync();
            }

            return Json(person);
        }

        public async Task<IActionResult> Update([FromBody]Person person)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var p = await _context.People.Where(x => x.Team.Name == Team)
                    .SingleAsync(x => x.Id == person.Id);
                    
                p.FirstName = person.FirstName;
                p.LastName = person.LastName;
                p.Email = person.Email;
                p.Tags = person.Tags;
                p.TeamPhone = person.TeamPhone;
                p.HomePhone = person.HomePhone;
                p.Title = person.Title;

                await _context.SaveChangesAsync();
                return Json(p);
            }
            return BadRequest(ModelState);
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