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

        Task<bool> IsInRoles(List<Role> roles, string teamName);

        Task<bool> IsInAdminRoles(List<Role> roles, User user);

        Task<bool> IsInRoles(List<Role> roles, string teamName, User user);

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

        public async Task<bool> IsInRoles(List<Role> roles, string teamName)
        {
            var user = await GetUser();
            var team = await _dbContext.Teams.SingleAsync(t => t.Name == teamName);

            _dbContext.Entry(team)
                .Collection(t=> t.TeamPermissions)
                .Query()
                .Where(tp=> tp.User==user)
                .Load();
                
            if (team.TeamPermissions.Any(a=> roles.Contains(a.Role)))
            {
                return true;
            }
            var admin = await _dbContext.SystemPermissions.Where(sp => sp.User == user).ToListAsync();
            if (admin.Any(b => roles.Contains(b.Role)))
            {
                return true;
            }
            
            return false;
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamName, User user)
        {
            var team = await _dbContext.Teams.SingleAsync(t => t.Name == teamName);

            _dbContext.Entry(team)
                .Collection(t => t.TeamPermissions)
                .Query()
                .Where(tp => tp.User == user)
                .Load();

            if (team.TeamPermissions.Any(a => roles.Contains(a.Role)))
            {
                return true;
            }

            var admin = await _dbContext.SystemPermissions.Where(sp => sp.User == user).ToListAsync();
            if (admin.Any(b => roles.Contains(b.Role)))
            {
                return true;
            }
            return false;
        }

        public async Task<bool> IsInAdminRoles(List<Role> roles, User user)
        {
            var admin = await _dbContext.SystemPermissions.Where(sp => sp.User == user).ToListAsync();
            if (admin.Any(b => roles.Contains(b.Role)))
            {
                return true;
            }
            return false;
        }

        public async Task<bool> IsInRole(string roleCode, string teamName)
        {
            var role = await _dbContext.Roles.SingleOrDefaultAsync(x => x.Name == roleCode);
            if (role == null)
            {
                throw  new ArgumentException("Role not found");
            }
            var team = await _dbContext.Teams
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.Role)
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
            var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId);
            return user;
        }

        public async Task<Person> GetPerson(string teamName)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var person =
                await _dbContext.People.SingleOrDefaultAsync(p => p.User.Id == userId && p.Team.Name == teamName);
            return person;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            var users = await _dbContext.TeamPermissions.Where(x => x.TeamId == teamId && roles.Any(r=> r.Id==x.RoleId)).Select(tp=>tp.User).Distinct().ToListAsync();
            
            return users;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, string teamName)
        {
            var users = await _dbContext.TeamPermissions.Where(x => x.Team.Name== teamName && roles.Any(r => r.Id == x.RoleId)).Select(tp => tp.User).Distinct().ToListAsync();

            return users;
        }

        public async Task<List<TeamPermission>> GetUserRolesInTeam(Team team) {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var userPermissions = await _dbContext.TeamPermissions.Where(x => x.TeamId == team.Id && x.User.Id == userId).ToListAsync();
            return userPermissions;
        }

        public async Task<List<Role>> GetUserRolesInTeamOrAdmin(Team team)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var userPermissions = await _dbContext.TeamPermissions.Where(x => x.TeamId == team.Id && x.User.Id == userId).Select(tp=> tp.Role).ToListAsync();
            var admin = await _dbContext.SystemPermissions.Where(sp => sp.User.Id == userId).Select(sp=> sp.Role).ToListAsync();
            userPermissions.AddRange(admin);
            return userPermissions;
        }
    }
}
