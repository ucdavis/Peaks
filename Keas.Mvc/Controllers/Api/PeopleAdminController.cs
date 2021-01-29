using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.PersonManagerAccess)]
    [ApiController]
    [Route("api/{teamName}/peopleadmin/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class PeopleAdminController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        private readonly INotificationService _notificationService;
        private readonly ISecurityService _securityService;

        public PeopleAdminController(ApplicationDbContext context, IIdentityService identityService, INotificationService notificationService, ISecurityService securityService)
        {
            this._context = context;
            this._identityService = identityService;
            _notificationService = notificationService;
            _securityService = securityService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(Person), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Update([FromBody]Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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
            p.Supervisor = person.Supervisor;
            p.SupervisorId = person.SupervisorId;

            if (person.Supervisor != null)
            {
                _context.Attach(p.Supervisor);
            }


            await _context.SaveChangesAsync();
            return Json(p);

        }

        [HttpPost("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var person = await _context.People
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.User)
                .SingleAsync(x => x.Id == id);

            var personActing = await _securityService.GetPerson(Team);

            if (personActing.UserId == person.UserId)
            {
                ModelState.AddModelError("User", "Don't delete yourself.");
                return BadRequest(ModelState);
            }

            //Yes, await using and await BeginTransactionAsync works...
            await using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                var personToUpdate = await _context.People.SingleAsync(a => a.Id == person.Id && a.TeamId == person.TeamId);
                personToUpdate.Active = false;

                await _notificationService.PersonUpdated(person, null, Team, personActing.Name, personActing.UserId, PersonNotification.Actions.Deactivated, String.Empty);

                //Remove any Admin roles for that team
                var teamPermissionsToDelete = await _context.TeamPermissions.Where(a => a.TeamId == person.TeamId && a.UserId == personToUpdate.UserId).ToArrayAsync();
                if (teamPermissionsToDelete.Any())
                {
                    _context.TeamPermissions.RemoveRange(teamPermissionsToDelete);
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Json(null);
            }

        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<Person>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Details(int id, bool showAccessAssignments = false, bool showKeySerialAssignments = false, bool showEquipmentAssignments = false, bool showWorkstationAssignments = false, bool showDocuments = false)
        {
            var peopleQuery = _context.People
                .IgnoreQueryFilters()
                .Where(a => a.Team.Slug == Team)
                .Include(a => a.User)
                .Include(a => a.Supervisor)
                .AsNoTracking();


            if (showAccessAssignments)
            {
                peopleQuery = peopleQuery
                    .Include(a => a.AccessAssignments)
                    .ThenInclude(a => a.Access);
            }
            if (showKeySerialAssignments)
            {
                peopleQuery = peopleQuery
                    .Include(a => a.KeySerialAssignments)
                    .ThenInclude(a => a.KeySerial)
                    .ThenInclude(a => a.Key);
            }
            if (showEquipmentAssignments)
            {
                peopleQuery = peopleQuery
                    .Include(a => a.EquipmentAssignments)
                    .ThenInclude(a => a.Equipment);
            }
            if (showWorkstationAssignments)
            {
                peopleQuery = peopleQuery
                    .Include(a => a.WorkstationAssignments)
                    .ThenInclude(a => a.Workstation);
            }

            if (showDocuments)
            {
                peopleQuery = peopleQuery
                    .Include(a => a.Documents);
            }

            var people = await peopleQuery.SingleOrDefaultAsync(x => x.Id == id);

            return Json(people);
        }

        /// <summary>
        /// Return history records
        /// Defaults to a max of 5 records returned
        /// </summary>
        /// <param name="id"></param>
        /// <param name="max">the max number of record to take. Defaults to 5</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<History>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int id, int max = 5)
        {
            var history = await _context.Histories.Where(x => x.TargetId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(max).AsNoTracking().ToListAsync();

            return Json(history);
        }
    }
}
