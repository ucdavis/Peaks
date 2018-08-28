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
            // this will return either an existing person (regardless of if they are active or not)
            // or it will return a new person based on the user info

            var comparison = StringComparison.OrdinalIgnoreCase;
            // first try and find an existing person
            var existingPerson = await _context.People
                .Where(x => x.Team.Name == Team && (String.Equals(x.Email,searchTerm,comparison) || String.Equals(x.UserId,searchTerm,comparison)))
                .FirstOrDefaultAsync();
            if(existingPerson != null)
            {
                return Json(existingPerson);
            }
            // then try and find an existing user
            var user = await _context.Users.Where(x => String.Equals(x.Email,searchTerm,comparison)
                || String.Equals(x.Email,searchTerm,comparison)) //case-insensitive version of .Contains
                .AsNoTracking().FirstOrDefaultAsync();
            // then try and find a user in the system
            if (user==null)
            {
                if(searchTerm.Contains("@"))
                {
                    user = await _identityService.GetByEmail(searchTerm);
                }
                else
                {
                    user = await _identityService.GetByKerberos(searchTerm);
                }
            }
            if(user == null)
            {
                return NotFound();
            }
            // person.Id being 0 is used in the js to validate
            var person = new Person {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserId = user.Id,
                User = user
            };
            return Json(person);
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
                // if we are not being sent in an already existing, active person
                if(person.Active && person.Id != 0)
                {
                    return BadRequest();
                }
                var team = await _context.Teams.SingleAsync(t => t.Name == Team && t.Id == person.TeamId);
                // new person
                if(person.Id == 0)
                {
                    // have to get user so it doesn't try to add it
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == person.UserId);
                    if(user != null)
                    {
                        // if this user already exists, but isn't a person
                        person.User = user;
                    }
                    person.Team = team;
                    _context.People.Add(person);
                    await _context.SaveChangesAsync();
                    return Json(person);
                }
                // existing person
                if(!person.Active)
                {
                    // have to get this, so it doesn't think we are trying to add a new one
                    var existingPerson = await _context.People.Include(x => x.User)
                        .FirstOrDefaultAsync( p => p.TeamId == team.Id && p.UserId == person.UserId);
                    if(existingPerson != null)
                    {
                        // in case these were updated
                        existingPerson.FirstName = person.FirstName;
                        existingPerson.LastName = person.LastName;
                        existingPerson.Email = person.Email;
                        existingPerson.Tags = person.Tags;
                        existingPerson.Active = true;
                        await _context.SaveChangesAsync();
                        return Json(existingPerson);
                    }
                }
            }

            return BadRequest(ModelState);
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