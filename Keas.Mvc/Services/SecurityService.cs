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

        Task<bool> IsInRoles(List<Role> roles, string teamSlug);

        Task<bool> IsInAdminRoles(List<Role> roles, User user);

        Task<bool> IsInAdminRoles(string[] roles, string userId);

        Task<bool> IsInRoles(List<Role> roles, string teamSlug, User user);

        Task<bool> IsInRoles(string[] roles, string teamSlug, string userId);

        Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId);

        Task<User> GetUser();

        Task<Person> GetPerson(string teamSlug);

        Task<Person> GetPerson(int teamId);

        Task<List<User>> GetUsersInRoles(List<Role> roles, string teamSlug);

        Task<List<TeamPermission>> GetUserRolesInTeam(Team team);

        Task<List<Role>> GetUserRolesInTeamOrAdmin(Team team);

        Task<List<Role>> GetUserRolesInTeamOrAdmin(string teamSlug);

        Task<bool> IsInTeamOrAdmin(string teamslug);

        bool IsRoleOrDAInList(List<Role> list, string roleName);
    }
    public class SecurityService : ISecurityService
    {

        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;
        private readonly ISessionManagementService _sessionManagementService;

        public SecurityService(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext, ISessionManagementService sessionManagementService)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
            _sessionManagementService = sessionManagementService;
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamSlug)
        {
            var user = await GetUser();

            var team = await _dbContext.Teams
                .AsNoTracking()
                .SingleAsync(t => t.Slug == teamSlug);

            var roleIds = roles.Select(a => a.Id).ToArray();

            var inRole = await _dbContext.TeamPermissions
                .AsNoTracking()
                .AnyAsync(a => a.Team == team && a.UserId == user.Id && roleIds.Contains(a.RoleId));

            if (inRole)
            {
                return true;
            }

            return await _dbContext.SystemPermissions
                .AsNoTracking()
                .AnyAsync(a => a.UserId == user.Id && roleIds.Contains(a.RoleId));
        }

        public async Task<bool> IsInRoles(string[] roles, string teamSlug, string userId)
        {
            var roleNames = await _sessionManagementService.GetTeamRoleNames(teamSlug);
            return roleNames.Intersect(roles).Any();
            //return await _dbContext.TeamPermissions
            //        .AsNoTracking().
            //        AnyAsync(p => p.UserId == userId && p.Team.Slug == teamSlug && roles.Contains(p.Role.Name));
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamSlug, User user)
        {
            var team = await _dbContext.Teams
                .AsNoTracking()
                .SingleAsync(t => t.Slug == teamSlug);

            var roleIds = roles.Select(a => a.Id).ToArray();

            var inRole = await _dbContext.TeamPermissions
                .AsNoTracking()
                .AnyAsync(a => a.Team == team && a.UserId == user.Id && roleIds.Contains(a.RoleId));

            if (inRole)
            {
                return true;
            }

            return await _dbContext.SystemPermissions
                .AsNoTracking()
                .AnyAsync(a => a.UserId == user.Id && roleIds.Contains(a.RoleId));
        }

        public async Task<bool> IsInAdminRoles(List<Role> roles, User user)
        {
            var roleIds = roles.Select(a => a.Id).ToArray();

            return await _dbContext.SystemPermissions
                .AsNoTracking()
                .AnyAsync(a => a.UserId == user.Id && roleIds.Contains(a.RoleId));
        }

        public async Task<bool> IsInAdminRoles(string[] roles, string userId)
        {
            return await _dbContext.SystemPermissions
                .AsNoTracking()
                .AnyAsync(a => a.UserId == userId && roles.Contains(a.Role.Name));
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


        public async Task<List<Role>> GetUserRolesInTeamOrAdmin(Team team)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var userPermissions = await _dbContext.TeamPermissions
                .Where(x => x.TeamId == team.Id && x.User.Id == userId)
                .Select(tp => tp.Role)
                .AsNoTracking()
                .ToListAsync();

            var admin = await _dbContext.SystemPermissions
                .Where(sp => sp.User.Id == userId)
                .Select(sp => sp.Role)
                .AsNoTracking()
                .ToListAsync();

            userPermissions.AddRange(admin);
            return userPermissions;
        }

        public async Task<List<Role>> GetUserRolesInTeamOrAdmin(string teamSlug)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var userPermissions = await _dbContext.TeamPermissions
                .Where(x => x.Team.Slug == teamSlug && x.User.Id == userId)
                .Select(tp => tp.Role)
                .AsNoTracking()
                .ToListAsync();

            var admin = await _dbContext.SystemPermissions
                .Where(sp => sp.User.Id == userId)
                .Select(sp => sp.Role)
                .AsNoTracking()
                .ToListAsync();

            userPermissions.AddRange(admin);
            return userPermissions;
        }

        public async Task<bool> IsInTeamOrAdmin(string teamslug)
        {
            var person = await GetPerson(teamslug);
            if (person != null)
            {
                return true;
            }
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            return await _dbContext.SystemPermissions
                .AsNoTracking()
                .AnyAsync(sp => sp.User.Id == userId);
        }

        public bool IsRoleOrDAInList(List<Role> list, string roleName)
        {
            if(list.Where(r => r.Name == Role.Codes.DepartmentalAdmin).Any() || list.Where(r => r.Name == roleName).Any())
            {
                return true;
            } else 
            {
                return false;
            }
        }
    }
}
