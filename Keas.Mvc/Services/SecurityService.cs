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

namespace Keas.Mvc.Services
{
    
    public interface ISecurityService
    {
        Task<bool> HasKeyMasterAccess(string teamName);

        Task<bool> IsInRole(string roleCode, string teamName);

        Task<bool> IsInRoles(List<Role> roles, string teamName);

        Task<bool> IsInRoles(List<Role> roles, string teamName, User user);

        Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId);
        Task<User> GetUser();


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
            var user = GetUser().Result;
            using (_dbContext)
            {
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
            }
            return false;
        }

        public async Task<bool> IsInRoles(List<Role> roles, string teamName, User user)
        {
            using (_dbContext)
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
            return IsInRole(role, team);
        }

        private bool IsInRole(Role role, Team team)
        {
            var user = GetUser().Result;
            return team.TeamPermissions.Any(a => a.User == user && a.Role == role);
        }

        public async Task<User> GetUser()
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.Email == userId);
            return user;
        }

        public async Task<List<User>> GetUsersInRoles(List<Role> roles, int teamId)
        {
            List<User> users = new List<User>();
            var teamPermissions = await _dbContext.TeamPermissions.Include(tp=> tp.User).Where(x => x.TeamId == teamId && roles.Contains(x.Role)).ToListAsync();

            foreach (var tp in teamPermissions)
            {
                if (users.Count == 0)
                {
                    users.Add(tp.User);
                }
                else
                {
                    if (!users.Any(a => a.Id == tp.UserId))
                    {
                        users.Add(tp.User);
                    }
                }
            }

            return users;
        }

        public async Task<bool> HasKeyMasterAccess(string teamName)
        {
            var team = await _dbContext.Teams.SingleOrDefaultAsync(x => x.Name == teamName);
            if (team == null)
            {
                return false;
            }
            
            var user = GetUser().Result;
            if (user == null)
            {
                return false;
            }
            var query = await _dbContext.TeamPermissions.SingleOrDefaultAsync(x => x.Team == team && (x.Role.Name == "KeyMaster" || x.Role.Name== "DepartmentalAdmin") && x.User == user) ;
            
            if (query == null)
            {
                return false;
            }
            return true;

        }
    }
}
