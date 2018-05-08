using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class KeysController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;

        public KeysController(ApplicationDbContext context, IEventService eventService)
        {
            this._context = context;
            _eventService = eventService;
        }

        public string GetTeam()
        {
            return Team;
        }

        public async Task<IActionResult> Search(string teamName, string q)
        {
            var comparison = StringComparison.InvariantCultureIgnoreCase;
            var keys = await _context.Keys
                .Where(x => x.Team.Name == teamName && x.Active && x.Assignment == null &&
                (x.Name.StartsWith(q, comparison) || x.SerialNumber.StartsWith(q, comparison)))
                .AsNoTracking().ToListAsync();

            return Json(keys);
        }

        public async Task<IActionResult> GetKeysInRoom(string roomKey)
        {
            var equipment = await _context.Keys.Where(x => x.Room.RoomKey == roomKey).AsNoTracking().ToListAsync();
            return Json(equipment);
        }


        public async Task<IActionResult> ListAssigned(string teamName, int personId) {
            var keyAssignments = await _context.Keys
                .Where(x=> x.Assignment.PersonId == personId && x.Team.Name == teamName)
                .Include(x=> x.Assignment)
                .ThenInclude(x => x.Person.User)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(keyAssignments);
        }

        // List all keys for a team
        public async Task<IActionResult> List(string teamName) {
            var keys = await _context.Keys.Where(x=> x.Team.Name == teamName)
                .Include(x=> x.Assignment)
                .ThenInclude(x => x.Person.User)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(keys);
        }
        public async Task<IActionResult> Create(string teamName, [FromBody]Key key)
        {
            // TODO Make sure user has permissions
            if (ModelState.IsValid)
            {
                _context.Keys.Add(key);
                await _context.SaveChangesAsync();
                await _eventService.TrackCreateKey(key);
            }
            return Json(key);
        }

        public async Task<IActionResult> Assign(string teamName, int keyId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure equipment exists, makes sure equipment is in this team
            if (ModelState.IsValid)
            {
                var key = await _context.Keys.Where(x => x.Team.Name == teamName).SingleAsync(x => x.Id == keyId);
                key.Assignment = new KeyAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                key.Assignment.Person = await _context.People.Include(p=> p.User).SingleAsync(p=> p.Id==personId);

                _context.KeyAssignments.Add(key.Assignment);

                await _context.SaveChangesAsync();
                await _eventService.TrackAssignKey(key);
                return Json(key);
            }
            return BadRequest(ModelState);
        }

        public async Task<IActionResult> Revoke(string teamName, [FromBody]Key key)
        {
            //TODO: check permissions
            if (ModelState.IsValid)
            {
                var k = await _context.Keys.Where(x => x.Team.Name == teamName).Include(x => x.Assignment).SingleAsync(x => x.Id == key.Id);

                _context.KeyAssignments.Remove(k.Assignment);
                k.Assignment = null;
                k.KeyAssignmentId = null;
                await _context.SaveChangesAsync();
                await _eventService.TrackUnAssignKey(key);
                return Json(k);
            }
            return BadRequest(ModelState);
        }
    }
}