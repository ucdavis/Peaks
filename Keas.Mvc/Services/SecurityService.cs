using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Helpers;
using Microsoft.Extensions.Options;
using Keas.Mvc.Models;

namespace Keas.Mvc.Services
{

    public interface ISecurityService
    {
        Task<bool> IsInRole(string roleCode, string teamSlug);

        Task<bool> IsInAdminRoles(string[] roles, string userId);

        Task<bool> IsInRoles(string[] roles, string teamSlug, string userId);

        Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId);

        Task<User> GetUser();

        Task<Person> GetPerson(string teamSlug);

        Task<Person> GetPerson(int teamId);

        Task<List<User>> GetUsersInRoles(List<Role> roles, string teamSlug);


        Task<string[]> GetUserRoleNamesInTeamOrAdmin(string teamSlug);

        Task<bool> IsInTeamOrAdmin(string teamslug);

        bool IsRoleNameOrDAInArray(string[] roles, string roleName);

        Task<bool> IsTeamValid(string slug, int teamId);
        Task<bool> IsSpaceInTeam(string slug, int spaceId);
        Task<bool> IsPersonInTeam(string slug, int personId);

    }
    public class SecurityService : ISecurityService
    {

        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;
        private readonly ITeamsManager _teamsManager;
        private readonly ApiSettings _apiSettings;

        public SecurityService(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext, ITeamsManager teamsManager, IOptions<ApiSettings> apiSettings)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
            _teamsManager = teamsManager;
            _apiSettings = apiSettings.Value;
        }

        public async Task<bool> IsInRoles(string[] roles, string teamSlug, string userId)
        {
            var roleNames = await _teamsManager.GetTeamRoleNames(teamSlug);
            return roles.Intersect(roleNames).Any();
        }


        public async Task<bool> IsInAdminRoles(string[] roles, string userId)
        {
            var systemRoleNames = await _teamsManager.GetSystemRoleNames();
            return roles.Intersect(systemRoleNames).Any();
        }

        public async Task<bool> IsInRole(string roleCode, string teamSlug)
        {
            var roleNames = await _teamsManager.GetTeamRoleNames(teamSlug);
            return roleNames.Contains(roleCode);

        }

        public async Task<User> GetUser()
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var user = await _dbContext.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == userId);

            return user;
        }

        public async Task<Person> GetPerson(string teamSlug)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            if (userId == null && ApiHelper.isApiUser(_contextAccessor.HttpContext.User)) {
                userId = _apiSettings.UserId;
            }

            var person = await _dbContext.People
                .AsNoTracking()
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Slug == teamSlug);

            return person;
        }

        public async Task<Person> GetPerson(int teamId)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            if (userId == null && ApiHelper.isApiUser(_contextAccessor.HttpContext.User))
            {
                userId = _apiSettings.UserId;
            }

            var person = await _dbContext.People
                .AsNoTracking()
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Id == teamId);

            return person;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            var roleIds = roles.Select(r => r.Id).ToArray();

            var users = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == teamId && roleIds.Contains(x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .AsNoTracking()
                .ToListAsync();

            return users;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, string teamSlug)
        {
            var roleIds = roles.Select(r => r.Id).ToArray();

            var users = await _dbContext.TeamPermissions
                .Where(x => x.Team.Slug == teamSlug && roleIds.Contains(x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .AsNoTracking()
                .ToListAsync();

            return users;
        }

        public async Task<string[]> GetUserRoleNamesInTeamOrAdmin(string teamSlug)
        {
            return await _teamsManager.GetTeamOrAdminRoleNames(teamSlug);
        }

        public async Task<bool> IsInTeamOrAdmin(string teamslug)
        {
            var person = await GetPerson(teamslug);
            if (person != null)
            {
                return true;
            }

            var systemRoles = await _teamsManager.GetSystemRoleNames();
            return systemRoles.Length > 0;
        }

        public bool IsRoleNameOrDAInArray(string[] roles, string roleName)
        {
            if (roles.Contains(Role.Codes.DepartmentalAdmin) || roles.Contains(roleName))
            {
                return true;
            }

            return false;
        }

        public async Task<bool> IsTeamValid(string slug, int teamId)
        {
            return await _dbContext.Teams.AnyAsync(a => a.Slug == slug && a.Id == teamId);
        }

        public async Task<bool> IsSpaceInTeam(string slug, int spaceId)
        {
            var teamId = await _dbContext.Teams.Where(a => a.Slug == slug).Select(s => s.Id).SingleAsync();
            var teamOrgs = await _dbContext.FISOrgs.Where(a => a.TeamId == teamId).Select(s => s.OrgCode).ToArrayAsync();
            
            return await _dbContext.Spaces.AnyAsync(a => a.Id == spaceId && teamOrgs.Contains(a.OrgId));
        }

        public async Task<bool> IsPersonInTeam(string slug, int personId)
        {
            var teamId = await _dbContext.Teams.Where(a => a.Slug == slug).Select(s => s.Id).SingleAsync();
            return await _dbContext.People.AnyAsync(a => a.Id == personId && a.TeamId == teamId);
        }
    }
}
