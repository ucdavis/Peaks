using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Serilog;

namespace Keas.Mvc.Services
{
    public interface ITeamsManager
    {
        Task<string[]> GetTeamRoleNames(string slug);
        Task<string[]> GetTeamOrAdminRoleNames(string slug);
        Task<string[]> GetSystemRoleNames();
        Task<Dictionary<string, string>> GetMyTeams();
        void ClearTeamSession();

    }

    public class TeamsManager : ITeamsManager
    {
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;
        private const string RolesSessionKey = "TeamRolesSessionKey";


        public TeamsManager(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext)
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
            var roleContainer = GetRoleContainer();
            roleContainer = await GetTeams(slug, roleContainer);
            
            return roleContainer.Teams.First(a => a.TeamName == slug).TeamRoles;
        }

        public async Task<string[]> GetTeamOrAdminRoleNames(string slug)
        {
            var roleContainer = GetRoleContainer();
            roleContainer = await GetTeams(slug, roleContainer);
            roleContainer = await GetSystemRoles(roleContainer);

            var rolesNames = roleContainer.Teams.First(a => a.TeamName == slug).TeamRoles;


            return rolesNames.Union(roleContainer.SystemRoles.TeamRoles).Distinct().ToArray();
        }

        public async Task<string[]> GetSystemRoleNames()
        {
            var roleContainer = GetRoleContainer();
            roleContainer = await GetSystemRoles(roleContainer);

            return roleContainer.SystemRoles.TeamRoles;
        }

        public void ClearTeamSession()
        {
            _contextAccessor.HttpContext.Session.Remove(RolesSessionKey);
        }

        public async Task<Dictionary<string, string>> GetMyTeams()
        {
            var roleContainer = GetRoleContainer();
            roleContainer = await GetTeamDictionary(roleContainer);
            return roleContainer.TeamDictionary;

        }

        private async Task<RoleContainer> GetTeamDictionary(RoleContainer roleContainer)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            if (roleContainer.TeamDictionary == null)
            {
                roleContainer.TeamDictionary = await _dbContext.People.Where(p => p.User.Id == userId).AsNoTracking()
                    .Select(a => new {a.Team.Slug, a.Team.Name}).ToDictionaryAsync(a => a.Slug, a => a.Name);
                _contextAccessor.HttpContext.Session.SetString(RolesSessionKey, JsonConvert.SerializeObject(roleContainer));
            }

            return roleContainer;
        }

        private RoleContainer GetRoleContainer()
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;

            var sessionResult = _contextAccessor.HttpContext.Session.GetString(RolesSessionKey);

            var roleContainer = new RoleContainer();

            if (sessionResult == null)
            {
                roleContainer = new RoleContainer();
                roleContainer.UserId = userId;
            }
            else
            {
                try
                {
                    roleContainer = JsonConvert.DeserializeObject<RoleContainer>(sessionResult);
                }
                catch (Exception e)
                {
                    Log.Error(e.Message);
                    roleContainer = new RoleContainer();
                }

                if (roleContainer.UserId != userId)
                {
                    _contextAccessor.HttpContext.Session.Remove(RolesSessionKey);
                    roleContainer = new RoleContainer();
                    roleContainer.UserId = userId;
                }
            }

            return roleContainer;
        }

        private async Task<RoleContainer> GetSystemRoles(RoleContainer roleContainer)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var systemRole = roleContainer.SystemRoles;
            if (systemRole == null)
            {
                systemRole = new Team
                {
                    TeamName = "System",
                    TeamRoles = await _dbContext.SystemPermissions
                        .Where(a => a.UserId == userId).Select(a => a.Role.Name).Distinct().ToArrayAsync(),
                };
                roleContainer.SystemRoles = systemRole;
                _contextAccessor.HttpContext.Session.SetString(RolesSessionKey, JsonConvert.SerializeObject(roleContainer));
            }
            return roleContainer;
        }

        private async Task<RoleContainer> GetTeams(string slug, RoleContainer roleContainer)
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var team = roleContainer.Teams.FirstOrDefault(a => a.TeamName == slug);

            if (team == null)
            {
                team = new Team
                {
                    TeamName = slug,
                    TeamRoles = await _dbContext.TeamPermissions
                        .Where(a => a.Team.Slug == slug && a.UserId == userId)
                        .Select(a => a.Role.Name).ToArrayAsync(),
                };
                roleContainer.Teams.Add(team);

                _contextAccessor.HttpContext.Session.SetString(RolesSessionKey, JsonConvert.SerializeObject(roleContainer));
            }

            return roleContainer;
        }


        public class RoleContainer
        {
            public RoleContainer()
            {
                Teams = new List<Team>();
            }
            public string UserId { get; set; }
            public List<Team> Teams { get; set; }

            public Team SystemRoles { get; set; }
            public Dictionary<string, string> TeamDictionary { get; set; }
        }

        public class Team
        {
            public string TeamName { get; set; }
            public string[] TeamRoles { get; set; }
        }

    }
}
