using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
   [Authorize(Policy = AccessCodes.Codes.DepartmentAdminAccess)]
    public class PeopleAdminController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        private readonly INotificationService _notificationService;

        public PeopleAdminController(ApplicationDbContext context, IIdentityService identityService, INotificationService notificationService)
        {
            this._context = context;
            this._identityService = identityService;
            _notificationService = notificationService;
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
               
                await _notificationService.PersonUpdated(person, null, Team, User.GetNameClaim(), User.Identity.Name, PersonNotification.Actions.Deactivated, String.Empty);

                //Remove any Admin roles for that team
                var teamPermissionsToDelete = await _context.TeamPermissions.Where(a => a.TeamId == person.TeamId && a.UserId == personToUpdate.UserId).ToArrayAsync();
                if (teamPermissionsToDelete.Any())
                {
                    _context.TeamPermissions.RemoveRange(teamPermissionsToDelete);
                }

                await _context.SaveChangesAsync();

                transaction.Commit();
                return Json(null);
            }

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
