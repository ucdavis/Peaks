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
    public class SearchController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;

        public SearchController(ApplicationDbContext context, IIdentityService identityService)
        {
            this._context = context;
            this._identityService = identityService;
        }

        public async Task<IActionResult> PeopleList()
        {
            var teamId = await _context.Teams.Where(a => a.Slug == Team).Select(s => s.Id).SingleAsync();

            var sql = PeopleQueries.List;

            var result = await _context.Database.GetDbConnection().QueryAsync(sql, new { teamId });

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

        public async Task<IActionResult> SearchUser(string searchTerm)
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

        public async Task<IActionResult> PersonDetails(int? id)
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

        public async Task<IActionResult> GetPerson(int personId)
        {
            var person = await _context.People
                .Where(x => x.Team.Slug == Team && x.Id == personId).Include(x => x.User).AsNoTracking().SingleAsync();
            return Json(person);
        }
    }
}
