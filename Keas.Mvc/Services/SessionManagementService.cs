using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Rewrite.Internal.ApacheModRewrite;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace Keas.Mvc.Services
{
    public interface ISessionManagementService
    {
        Task<string[]> GetTeamRoleNames(string slug);
    }

    public class SessionManagementService : ISessionManagementService
    {
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;

        public SessionManagementService(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Will return empty array if no roles.
        /// </summary>
        /// <param name="slug"></param>
        /// <returns></returns>
        public async Task<string[]> GetTeamRoleNames(string slug)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            if (_contextAccessor.HttpContext.Session.GetString($"UserId:{userId}") != userId)
            {
                _contextAccessor.HttpContext.Session.Clear(); //Abandon?
                _contextAccessor.HttpContext.Session.SetString($"UserId:{userId}", userId);
            }

            var teamRoles = _contextAccessor.HttpContext.Session.GetString(slug);

            if (teamRoles == null)
            {
                var roles = await _dbContext.TeamPermissions.Where(a => a.Team.Slug == slug && a.UserId == userId)
                    .Select(a => a.Role.Name).ToArrayAsync();
                _contextAccessor.HttpContext.Session.SetString(slug, JsonConvert.SerializeObject(roles));
                teamRoles = _contextAccessor.HttpContext.Session.GetString(slug);
            }


            return JsonConvert.DeserializeObject<string[]>(teamRoles);
        }

    }
}
