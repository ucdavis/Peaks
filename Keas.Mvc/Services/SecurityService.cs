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
        Task<bool> HasKeyMasterAccess(ApplicationDbContext context, string teamName);

        Task<bool> IsInRole(ApplicationDbContext context, string roleCode, string teamName);

        Task<bool> IsInRoles(ApplicationDbContext context, List<Role> roles, string teamName);
    }
    public class SecurityService : ISecurityService
    {
        
        private readonly IHttpContextAccessor _contextAccessor;

        public SecurityService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<bool> IsInRoles(ApplicationDbContext context, List<Role> roles, string teamName)
        {
            var user = GetUser(context).Result;
            using (context)
            {
                var team = await context.Teams.SingleAsync(t => t.Name == teamName);

                context.Entry(team)
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

        public async Task<bool> IsInRole(ApplicationDbContext context, string roleCode, string teamName)
        {
            var role = await context.Roles.SingleOrDefaultAsync(x => x.Name == roleCode);
            if (role == null)
            {
                throw  new ArgumentException("Role not found");
            }
            var team = await context.Teams
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.User)
                .Include(t=> t.TeamPermissions)
                    .ThenInclude(tp=> tp.Role)
                .SingleOrDefaultAsync(x => x.Name == teamName);
            if (team == null)
            {
                throw new ArgumentException("Team not found");
            }
            return IsInRole(context, role, team);
        }

        private bool IsInRole(ApplicationDbContext context, Role role, Team team)
        {
            var user = GetUser(context).Result;
            return team.TeamPermissions.Any(a => a.User == user && a.Role == role);
        }

        public async Task<User> GetUser(ApplicationDbContext context)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var user = await context.Users.SingleOrDefaultAsync(x => x.Email == userId);
            return user;
        }
        

        public async Task<bool> HasKeyMasterAccess(ApplicationDbContext context, string teamName)
        {
            var team = await context.Teams.SingleOrDefaultAsync(x => x.Name == teamName);
            if (team == null)
            {
                return false;
            }
            
            var user = GetUser(context).Result;
            if (user == null)
            {
                return false;
            }
            var query = await context.TeamPermissions.SingleOrDefaultAsync(x => x.Team == team && (x.Role.Name == "KeyMaster" || x.Role.Name== "DepartmentalAdmin") && x.User == user) ;
            
            if (query == null)
            {
                return false;
            }
            return true;

        }
    }
}
