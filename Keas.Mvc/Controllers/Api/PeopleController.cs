using System;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = "DepartmentAdminAccess")]
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
