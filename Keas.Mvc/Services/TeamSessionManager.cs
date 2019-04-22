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
    public interface ITeamSessionManager
    {
        Task<Dictionary<string, string>> GetMyTeams();
        void ClearSessionRoles();
    }

    public class TeamSessionManager : ITeamSessionManager
    {
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ApplicationDbContext _dbContext;
        private const string RolesSessionKey = "TeamListSessionKey";

        public TeamSessionManager(IHttpContextAccessor contextAccessor, ApplicationDbContext dbContext)
        {
            _contextAccessor = contextAccessor;
            _dbContext = dbContext;
        }

        public void ClearSessionRoles()
        {
            _contextAccessor.HttpContext.Session.Remove(RolesSessionKey);
        }

        public async Task<Dictionary<string, string>> GetMyTeams()
        {
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            var sessionResult = _contextAccessor.HttpContext.Session.GetString(RolesSessionKey);
            var container = new TeamContainer();

            if (sessionResult == null)
            {
                container = new TeamContainer();
                container.UserId = userId;
            }
            else
            {
                try
                {
                    container = JsonConvert.DeserializeObject<TeamContainer>(sessionResult);
                }
                catch (Exception e)
                {
                    Log.Error(e.Message);
                    container = new TeamContainer();
                }

                if (container.UserId != userId)
                {
                    _contextAccessor.HttpContext.Session.Remove(RolesSessionKey);
                    container = new TeamContainer();
                    container.UserId = userId;
                }
            }

            if (container.TeamInfoList == null)
            {
                container.TeamInfoList = await _dbContext.People.Where(p => p.User.Id == userId).AsNoTracking()
                    .Select(a => new {a.Team.Slug, a.Team.Name}).ToDictionaryAsync(a => a.Slug, a => a.Name);
                _contextAccessor.HttpContext.Session.SetString(RolesSessionKey, JsonConvert.SerializeObject(container));
            }


            return container.TeamInfoList;
        }


    }

    public class TeamContainer
    {
        public string UserId { get; set; }
        public Dictionary<string, string> TeamInfoList { get; set; }
    }

}
