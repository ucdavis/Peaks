using System;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
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

        public async Task<IActionResult> Details(int? id)
        {
            Person person;

            if (id.HasValue)
            {
                person = await _context.People.Where(x => x.Team.Slug == Team && x.Id == id.Value)
                    .Include(x => x.User).Include(x => x.Supervisor)
                    .AsNoTracking().SingleAsync();
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
                if (person.Active && person.Id != 0)
                {
                    return BadRequest();
                }
                var team = await _context.Teams.SingleAsync(t => t.Slug == Team && t.Id == person.TeamId);
                // new person
                if (person.Id == 0)
                {
                    // have to get user so it doesn't try to add it
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == person.UserId);
                    if (user != null)
                    {
                        // if this user already exists, but isn't a person
                        person.User = user;
                    }

                    if (person.Supervisor != null)
                    {
                        _context.People.Attach(person.Supervisor);
                    }
                    person.Team = team;
                    _context.People.Add(person);
                    await _context.SaveChangesAsync();
                    return Json(person);
                }
                // existing person
                if (!person.Active)
                {
                    // have to get this, so it doesn't think we are trying to add a new one
                    var existingPerson = await _context.People.Include(x => x.User)
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(p => p.TeamId == team.Id && p.UserId == person.UserId);
                    if (existingPerson != null)
                    {
                        // in case these were updated
                        existingPerson.FirstName = person.FirstName;
                        existingPerson.LastName = person.LastName;
                        existingPerson.Email = person.Email;
                        existingPerson.Tags = person.Tags;
                        existingPerson.Active = true;
                        existingPerson.HomePhone = person.HomePhone;
                        existingPerson.TeamPhone = person.TeamPhone;
                        if (person.Supervisor != null)
                        {
                            existingPerson.Supervisor = person.Supervisor;
                            _context.People.Attach(existingPerson.Supervisor);
                        }
                        existingPerson.StartDate = person.StartDate;
                        existingPerson.EndDate = person.EndDate;
                        existingPerson.Category = person.Category;
                        existingPerson.Notes = person.Notes;
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
                var p = await _context.People.Where(x => x.Team.Slug == Team)
                    .SingleAsync(x => x.Id == person.Id);

                p.FirstName = person.FirstName;
                p.LastName = person.LastName;
                p.Email = person.Email;
                p.Tags = person.Tags;
                p.TeamPhone = person.TeamPhone;
                p.HomePhone = person.HomePhone;
                p.Title = person.Title;
                p.StartDate = person.StartDate;
                p.EndDate = person.EndDate;
                p.Category = person.Category;
                p.Notes = person.Notes;

                if (person.Supervisor != null)
                {
                    p.Supervisor = person.Supervisor;
                    _context.Attach(p.Supervisor);
                }

                await _context.SaveChangesAsync();
                return Json(p);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Delete([FromBody]Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!person.Active)
            {
                return BadRequest(ModelState);
            }



            using (var transaction = _context.Database.BeginTransaction())
            {
                var personToUpdate = await _context.People.SingleAsync(a => a.Id == person.Id && a.TeamId == person.TeamId);
                personToUpdate.Active = false;

                await _context.SaveChangesAsync();

                transaction.Commit();
                return Json(null);
            }

        }

        public async Task<IActionResult> GetPerson(int personId)
        {
            var person = await _context.People
                .Where(x => x.Team.Slug == Team && x.Id == personId).Include(x => x.User).AsNoTracking().SingleAsync();
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
