using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace Keas.Mvc.Services
{
    public interface ISecurityService
    {
        Task<bool> HasKeyMasterAccess(ApplicationDbContext context, string team);
    }
    public class SecurityService : ISecurityService
    {
        
        private readonly IHttpContextAccessor _contextAccessor;

        public SecurityService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<bool> HasKeyMasterAccess(ApplicationDbContext context, string teamName)
        {
            var team = await context.Teams.SingleOrDefaultAsync(x => x.Name == teamName);
            if (team == null)
            {
                return false;
            }
            var userId = _contextAccessor.HttpContext.User.Identity.Name;
            //userId = "scott@email.com";
            var user = await context.Users.SingleOrDefaultAsync(x => x.Email == userId);
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
