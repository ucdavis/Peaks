using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Keas.Core.Data;
using Keas.Core.Domain;

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

        Task<List<TeamPermission>> GetUserRolesInTeam(Team team);

        Task<string[]> GetUserRoleNamesInTeamOrAdmin(string teamSlug);

        Task<bool> IsInTeamOrAdmin(string teamslug);

        bool IsRoleNameOrDAInArray(string[] roles, string roleName);
    }
    public class SecurityService : ISecurityService
    {

        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;
        private readonly IRolesSessionsManager _rolesSessionsManager;


        public SecurityService(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext, IRolesSessionsManager rolesSessionsManager)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
            _rolesSessionsManager = rolesSessionsManager;
        }

        public async Task<bool> IsInRoles(string[] roles, string teamSlug, string userId)
        {
            var roleNames = await _rolesSessionsManager.GetTeamRoleNames(teamSlug);
            return roles.Intersect(roleNames).Any();
        }


        public async Task<bool> IsInAdminRoles(string[] roles, string userId)
        {
            var systemRoleNames = await _rolesSessionsManager.GetSystemRoleNames();
            return roles.Intersect(systemRoleNames).Any();
        }

        public async Task<bool> IsInRole(string roleCode, string teamSlug)
        {
            var role = await _dbContext.Roles
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Name == roleCode);

            if (role == null)
            {
                throw new ArgumentException("Role not found");
            }

            var team = await _dbContext.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp => tp.User)
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp => tp.Role)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Slug == teamSlug);

            if (team == null)
            {
                throw new ArgumentException("Team not found");
            }

            return await IsInRole(role, team);
        }

        private async Task<bool> IsInRole(Role role, Team team)
        {
            var user = await GetUser();
            return team.TeamPermissions.Any(a => a.UserId == user.Id && a.RoleId == role.Id);
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

            var person = await _dbContext.People
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Slug == teamSlug);

            return person;
        }

        public async Task<Person> GetPerson(int teamId)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var person = await _dbContext.People
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Id == teamId);

            return person;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            var users = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == teamId && roles.Any(r => r.Id == x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .AsNoTracking()
                .ToListAsync();

            return users;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, string teamSlug)
        {
            var users = await _dbContext.TeamPermissions
                .Where(x => x.Team.Slug == teamSlug && roles.Any(r => r.Id == x.RoleId))
                .Select(tp => tp.User)
                .Distinct()
                .AsNoTracking()
                .ToListAsync();

            return users;
        }

        public async Task<List<TeamPermission>> GetUserRolesInTeam(Team team)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var userPermissions = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == team.Id && x.User.Id == userId)
                .AsNoTracking()
                .ToListAsync();

            return userPermissions;
        }

        public async Task<string[]> GetUserRoleNamesInTeamOrAdmin(string teamSlug)
        {
            return await _rolesSessionsManager.GetTeamOrAdminRoleNames(teamSlug);
        }

        public async Task<bool> IsInTeamOrAdmin(string teamslug)
        {
            var person = await GetPerson(teamslug);
            if (person != null)
            {
                return true;
            }

            var systemRoles = await _rolesSessionsManager.GetSystemRoleNames();
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
    }
}
