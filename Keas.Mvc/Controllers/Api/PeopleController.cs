using System;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
   [Authorize(Policy = AccessCodes.Codes.AnyRole)]
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
            var teamId = await _context.Teams.Where(a => a.Slug == Team).Select(s => s.Id).SingleAsync();

            var sql = PeopleQueries.List;

            var result = _context.Database.GetDbConnection().Query(sql, new { teamId });

            var people = result.Select(r => new
            {
                person = new Person
                {
                    Id = r.Id,
                    FirstName = r.FirstName,
                    LastName = r.LastName,
                    Email = r.Email,
                    Tags = r.Tags,
                    TeamId = r.TeamId,
                    Notes = r.Notes,
                    UserId = r.UserId,
                    Group = r.Group,
                    Title = r.Title,
                    HomePhone = r.HomePhone,
                    TeamPhone = r.TeamPhone,
                    SupervisorId = r.SupervisorId,
                    Supervisor = r.SupervisorId == null ? null : new Person
                    {
                        Id = r.SupervisorId,
                        FirstName = r.SupervisorFirstName,
                        LastName = r.SupervisorLastName,
                        Email = r.SupervisorEmail,
                        UserId = r.SupervisorUserId
                    },
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    Category = r.Category,
                    IsSupervisor = r.isSupervisor,
                },
                id = r.Id,
                equipmentCount = r.EquipmentCount,
                accessCount = r.AccessCount,
                keyCount = r.KeyCount,
                workstationCount = r.WorkstationCount,                
            });

            return Json(people);
        }

        public async Task<IActionResult> SearchPeople(string q)
        {
            var comparison = StringComparison.OrdinalIgnoreCase;
            var people = await _context.People
                .Where(x => x.Team.Slug == Team && x.Active &&
                (x.Email.IndexOf(q, comparison) >= 0 || x.Name.IndexOf(q, comparison) >= 0)) // case-insensitive version of .Contains
                .Include(x => x.User).AsNoTracking().ToListAsync();

            return Json(people);
        }

        public async Task<IActionResult> SearchUsers(string searchTerm)
        {
            // this will return either an existing person (regardless of if they are active or not)
            // or it will return a new person based on the user info

            var comparison = StringComparison.OrdinalIgnoreCase;
            // first try and find an existing person
            var existingPerson = await _context.People
                .Where(x => x.Team.Slug == Team && (String.Equals(x.Email, searchTerm, comparison) || String.Equals(x.UserId, searchTerm, comparison)))
                .Include(x => x.Supervisor)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();
            if (existingPerson != null)
            {
                return Json(existingPerson);
            }
            // then try and find an existing user
            var user = await _context.Users.Where(x => String.Equals(x.Email, searchTerm, comparison)
                || String.Equals(x.Email, searchTerm, comparison)) //case-insensitive version of .Contains
                .AsNoTracking().FirstOrDefaultAsync();
            // then try and find a user in the system
            if (user == null)
            {
                if (searchTerm.Contains("@"))
                {
                    user = await _identityService.GetByEmail(searchTerm);
                }
                else
                {
                    user = await _identityService.GetByKerberos(searchTerm);
                }
            }
            if (user == null)
            {
                return NotFound();
            }
            // person.Id being 0 is used in the js to validate
            var person = new Person
            {
                FirstName = user.FirstName.SafeHumanizeTitle(),
                LastName = user.LastName.SafeHumanizeTitle(),
                Email = user.Email,
                UserId = user.Id,
                User = user
            };
            return Json(person);
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
    }
}
