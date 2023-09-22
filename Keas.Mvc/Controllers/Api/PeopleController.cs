using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Dapper;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.AnyRole)]
    [ApiController]
    [Route("api/{teamName}/people/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class PeopleController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        private readonly INotificationService _notificationService;

        public PeopleController(ApplicationDbContext context, IIdentityService identityService, INotificationService notificationService)
        {
            this._context = context;
            this._identityService = identityService;
            _notificationService = notificationService;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filter">0 = ShowActive, 1 = ShowInactive, 2 = ShowAll. Defaults to Show Active</param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Person>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(ApiParameterModels.Filter filter = ApiParameterModels.Filter.ShowActive)
        {
            var teamId = await _context.Teams.Where(a => a.Slug == Team).Select(s => s.Id).SingleAsync();
            var active1 = 1;
            var active2 = 1;

            switch (filter)
            {
                case ApiParameterModels.Filter.ShowActive:
                    //Use defaults
                    break;
                case ApiParameterModels.Filter.ShowInactive:
                    active1 = 0;
                    active2 = 0;
                    break;
                case ApiParameterModels.Filter.ShowAll:
                    active1 = 1;
                    active2 = 0;
                    break;
                default:
                    throw new Exception("Unknown filter value");
            }

            var sql = PeopleQueries.List;

            var result = _context.Database.GetDbConnection().Query(sql, new { teamId, active1, active2 });

            var people = result.Select(r => new
            {
                person = new Person
                {
                    Id = r.Id,
                    FirstName = r.FirstName,
                    LastName = r.LastName,
                    Email = r.Email,
                    User = r.UserId == null ? null : new User
                    {
                        Id = r.UserId,
                        FirstName = r.FirstName,
                        LastName = r.LastName,
                        Email = r.Email,
                        Pronouns = r.Pronouns
                    },
                    Tags = r.Tags,
                    TeamId = r.TeamId,
                    Notes = r.Notes,
                    UserId = r.UserId,
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
                active = r.Active,
            });

            return Json(people);
        }
        

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Person>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchPeople(string q)
        {
            var people = await _context.People
                .Where(x => x.Team.Slug == Team && x.Active &&
                (
                    EF.Functions.Like(x.Email, q.EfContains()) 
                    || EF.Functions.Like(x.FirstName, q.EfContains())
                    || EF.Functions.Like(x.LastName, q.EfContains())
                 ))
                .AsNoTracking().ToListAsync();

            return Json(people);
        }


        [HttpGet]
        [ProducesResponseType(typeof(Person), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchUsers(string searchTerm)
        {
            // this will return either an existing person (regardless of if they are active or not)
            // or it will return a new person based on the user info
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("Please supply a search term");
            }
            searchTerm = searchTerm?.Trim();
            // first try and find an existing person
            var existingPerson = await _context.People
                .Where(x => x.Team.Slug == Team && (x.Email == searchTerm || x.UserId == searchTerm))
                .Include(x => x.Supervisor)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();
            if (existingPerson != null)
            {
                return Json(existingPerson);
            }
            // then try and find an existing user
            var user = await _context.Users.Where(x => x.Email == searchTerm
                || x.Email == searchTerm) //case-insensitive version of .Contains
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
                User = user,
                Title = await _identityService.GetTitle(user.Iam)
            };
            var supervisorIam = await _identityService.GetIamSupervisor(user.Iam);
            if (!string.IsNullOrWhiteSpace(supervisorIam))
            {
                var superPerson = await _context.People
                    .Where(x => x.Team.Slug == Team && x.User.Iam == supervisorIam)
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync();
                if (superPerson != null)
                {
                    person.SupervisorId = superPerson.Id;
                    person.Supervisor = superPerson;
                }
            }
            return Json(person);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Person), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody] Person person)
        {
            //This commented out code would be much clearer, but I don't feel like updating and testing it now -- Jason
            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(person);
            //}

            //if (person.Id == 0)
            //{
            //    if (!person.Active)
            //    {
            //        return BadRequest("Creating an inactive person is bad...");
            //    }
            //    //Do create login
            //}
            //else
            //{
            //    //do Update logic
            //}
            if (string.IsNullOrWhiteSpace(person.UserId))
            {
                ModelState.AddModelError("UserId", "Missing UserId");
            }

            if (ModelState.IsValid)
            {
                // if we are being sent in an already existing, active person
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
                    else
                    {
                        //Force lookup. Don't trust passed user
                        person.User = await _identityService.GetByKerberos(person.UserId);
                    }

                    if (person.User == null)
                    {
                        return NotFound();
                    }

                    if (person.Supervisor != null)
                    {
                        _context.People.Attach(person.Supervisor);
                    }
                    person.Team = team;
                    _context.People.Add(person);
                    await _context.SaveChangesAsync(); //Need to save so I can get the personId for the notification service below.

                    await _notificationService.PersonUpdated(person, team, PersonNotification.Actions.Added, String.Empty);
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
                        existingPerson.Title = person.Title; //This was missing?

                        await _notificationService.PersonUpdated(existingPerson, team, PersonNotification.Actions.Reactivated, String.Empty);
                        await _context.SaveChangesAsync();
                        return Json(existingPerson);
                    }
                }
            }

            return BadRequest(ModelState);
        }
    }
}
