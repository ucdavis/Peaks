using System;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;
using Keas.Mvc.Models;
using Keas.Mvc.Services;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.SystemAdminAccess)]
    public class TeamController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserService _userService;

        public TeamController(ApplicationDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }



        // GET: Team/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Team/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<IActionResult> Create([Bind("Id,Name,Slug")] Team team)
        {
            if (await _context.Teams.AnyAsync(a => a.Slug == team.Slug))
            {
                ModelState.AddModelError("Slug", "Team Slug already used.");
            }

            if (ModelState.IsValid)
            {
                _context.Add(team);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index","Admin");
            }
            return View(team);
        }

        // GET: Team/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var team = await _context.Teams.SingleOrDefaultAsync(m => m.Id == id);
            if (team == null)
            {
                return NotFound();
            }
            return View(team);
        }

        // POST: Team/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // Updated as per MS docs https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/crud
        [HttpPost]
        public async Task<IActionResult> Edit(int id, Team team)
        {
            if (id != team.Id)
            {
                return NotFound();
            }

            if (await _context.Teams.AnyAsync(a => a.Id != team.Id && a.Slug == team.Slug))
            {
                ModelState.AddModelError("Slug", "Team Slug already used.");
            }

            if (!ModelState.IsValid)
            {
                return View(team);
            }
            var teamToUpdate = await _context.Teams.SingleOrDefaultAsync(x => x.Id == id);
            if (await TryUpdateModelAsync<Team>(teamToUpdate, "", t => t.Name, t=> t.Slug))
            {
                try
                {
                    await _context.SaveChangesAsync();
                    return RedirectToAction("Index","Admin");
                }
                catch
                {
                    ModelState.AddModelError("","Unable to save changes.");
                }
            }
            return View(team);
        }


        private bool TeamExists(int id)
        {
            return _context.Teams.Any(e => e.Id == id);
        }

        public IActionResult CreateGroup()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup(Group model)
        {
            if (await _context.Groups.AnyAsync(a => a.Name.Equals(model.Name, StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError("Name", "Group name already used");
            }

            if (ModelState.IsValid)
            {
                _context.Add(model);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Admin");
            }
            return View(model);
        }

        public async Task<IActionResult> GroupDetails(int id)
        {
            var group = await _context.Groups.Include(a => a.GroupPermissions).ThenInclude(a => a.User).Include(a => a.Teams).ThenInclude(a => a.Team).AsNoTracking().SingleAsync(a => a.Id == id);

            return View(group);
        }

        public async Task<IActionResult> AddGroupUser(int id)
        {
            var model = new GroupUserPostModel();
            model.Group = await _context.Groups.AsNoTracking().SingleAsync(a => a.Id == id);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddGroupUser(GroupUserPostModel model)
        {
            var group = await _context.Groups.AsNoTracking().SingleAsync(a => a.Id == model.Group.Id);

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.UserEmail || u.Id == model.UserEmail);

            if (user == null)
            {
                if (model.UserEmail.Contains("@"))
                {
                    user = await _userService.CreateUserFromEmail(model.UserEmail);
                }
                else
                {
                    user = await _userService.CreateUserFromKerberos(model.UserEmail);
                }
            }

            if (user == null)
            {
                ErrorMessage = "User not found";
                return View(model);
            }

            if (await _context.GroupPermissions.AnyAsync(a => a.GroupId == model.Group.Id && a.UserId == user.Id))
            {
                Message = "User Already Exists for group";
                return RedirectToAction("GroupDetails", "Team", new {id = model.Group.Id});
            }

            

            var groupPermission = new GroupPermission{ GroupId = group.Id, UserId = user.Id };

            _context.GroupPermissions.Add(groupPermission);
            await _context.SaveChangesAsync();
            Message = "User " + user.Name + " has been added.";
            return RedirectToAction("GroupDetails", "Team", new { id = model.Group.Id });
        }

        public async Task<IActionResult> RemoveGroupie(int id, int groupId)
        {
            var group = await _context.Groups.Include(a => a.GroupPermissions).SingleAsync(a => a.Id == groupId);
            var groupPermission = group.GroupPermissions.Single(a => a.Id == id);

            _context.GroupPermissions.Remove(groupPermission);

            await _context.SaveChangesAsync();

            Message = "User Removed";
            return RedirectToAction("GroupDetails", new {id = groupId});

        }

        public async Task<IActionResult> AddGroupTeam(int id)
        {
            var model = new GroupTeamPostModel{GroupId = id};
            model.GroupName = (await _context.Groups.SingleAsync(a => a.Id == id)).Name;
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddGroupTeam(GroupTeamPostModel model)
        {
            var group = await _context.Groups.Include(a => a.Teams).SingleAsync(a => a.Id == model.GroupId);
            if (group.Teams.Any(a => a.Team.Slug.Equals(model.TeamSlug, StringComparison.OrdinalIgnoreCase)))
            {
                ErrorMessage = "Team already Added";
                return RedirectToAction("GroupDetails", new {id = model.GroupId});
            }

            var team = await _context.Teams.SingleOrDefaultAsync(a => a.Slug.Equals(model.TeamSlug, StringComparison.OrdinalIgnoreCase));
            if (team == null)
            {
                ErrorMessage = "Team not found.";
                return View(model);
            }
            var groupTeam = new GroupXTeam{GroupId = model.GroupId, TeamId = team.Id};
            await _context.GroupXTeams.AddAsync(groupTeam);
            await _context.SaveChangesAsync();

            Message = $"Team {team.Name} ({team.Slug}) added.";
            return RedirectToAction("GroupDetails", new {id = model.GroupId});
        }
    }
}
