using System;
using System.Collections.Generic;
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore.Internal;

namespace Keas.Mvc.Services
{
    
    public interface ISecurityService
    {
        Task<bool> IsInRole(string roleCode, string teamName);

        Task<bool> IsInRoles(List<Role> roles, string teamSlug);

        Task<bool> IsInAdminRoles(List<Role> roles, User user);

        Task<bool> IsInRoles(List<Role> roles, string teamSlug, User user);

        Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId);
        Task<User> GetUser();

        Task<Person> GetPerson(string teamName);
        Task<List<User>> GetUsersInRoles(List<Role> roles, string teamName);

        Task<List<TeamPermission>> GetUserRolesInTeam(Team team);

        
        Task<List<Role>> GetUserRolesInTeamOrAdmin(Team team);
    }
    public class SecurityService : ISecurityService
    {
        
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;

        public SecurityService(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamSlug)
        {
            var user = await GetUser();
            var team = await _dbContext.Teams.SingleAsync(t => t.Slug == teamSlug);
            var roleIds = roles.Select(a => a.Id).ToArray();

            if (await _dbContext.TeamPermissions.AnyAsync(a => a.Team == team && a.User == user && roleIds.Contains(a.RoleId))){
                return true;
            }            
            return await _dbContext.SystemPermissions.AsNoTracking().AnyAsync(a => a.User == user && roleIds.Contains(a.RoleId));
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamSlug, User user)
        {
             var team = await _dbContext.Teams.SingleAsync(t => t.Slug == teamSlug);
            var roleIds = roles.Select(a => a.Id).ToArray();
            if (await _dbContext.TeamPermissions.AnyAsync(a => a.Team == team && a.User == user && roleIds.Contains(a.RoleId)))
            {
                return true;
            }

            return await _dbContext.SystemPermissions.AsNoTracking().AnyAsync(a => a.User == user && roleIds.Contains(a.RoleId));        
        }

        public async Task<bool> IsInAdminRoles(List<Role> roles, User user)
        {
            var roleIds = roles.Select(a => a.Id).ToArray();
            return await _dbContext.SystemPermissions.AsNoTracking().AnyAsync(a => a.User == user && roleIds.Contains(a.RoleId));
        }

        public async Task<bool> IsInRole(string roleCode, string teamName)
        {
            var role = await _dbContext.Roles.AsNoTracking().SingleOrDefaultAsync(x => x.Name == roleCode);
            if (role == null)
            {
                throw  new ArgumentException("Role not found");
            }
            var team = await _dbContext.Teams
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.Role)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Name == teamName);
            if (team == null)
            {
                throw new ArgumentException("Team not found");
            }
            return await IsInRole(role, team);
        }

        private async Task<bool> IsInRole(Role role, Team team)
        {
            var user = await GetUser();
            return team.TeamPermissions.Any(a => a.User == user && a.Role == role);
        }

        public async Task<User> GetUser()
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var user = await _dbContext.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == userId);
            return user;
        }

        public async Task<Person> GetPerson(string teamName)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var person =
                await _dbContext.People.AsNoTracking().SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Name == teamName);
            return person;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            var users = await _dbContext.TeamPermissions.Where(x => x.TeamId == teamId && roles.Any(r=> r.Id==x.RoleId)).Select(tp=>tp.User).Distinct().AsNoTracking().ToListAsync();
            
            return users;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, string teamName)
        {
            var users = await _dbContext.TeamPermissions.Where(x => x.Team.Name== teamName && roles.Any(r => r.Id == x.RoleId)).Select(tp => tp.User).Distinct().AsNoTracking().ToListAsync();

            return users;
        }

        public async Task<List<TeamPermission>> GetUserRolesInTeam(Team team) {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var userPermissions = await _dbContext.TeamPermissions.Where(x => x.TeamId == team.Id && x.User.Id == userId).AsNoTracking().ToListAsync();
            return userPermissions;
        }

        
        public async Task<List<Role>> GetUserRolesInTeamOrAdmin(Team team)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var userPermissions = await _dbContext.TeamPermissions.Where(x => x.TeamId == team.Id && x.User.Id == userId).Select(tp=> tp.Role).AsNoTracking().ToListAsync();
            var admin = await _dbContext.SystemPermissions.Where(sp => sp.User.Id == userId).Select(sp=> sp.Role).AsNoTracking().ToListAsync();
            userPermissions.AddRange(admin);
            return userPermissions;
        }
    }
}
