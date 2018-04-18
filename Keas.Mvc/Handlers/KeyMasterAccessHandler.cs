using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Attributes;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace Keas.Mvc.Handlers
{
    public class KeyMasterAccessHandler : AuthorizationHandler<VerifyKeyMasterAccess>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ISecurityService _securityService;

        public KeyMasterAccessHandler(ApplicationDbContext dbContext, ISecurityService securityService)
        {
            _dbContext = dbContext;
            _securityService = securityService;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, VerifyKeyMasterAccess requirement)
        {
            string team = "";
            if (context.Resource is AuthorizationFilterContext mvcContext)
            {
                team = mvcContext.RouteData.Values["teamName"].ToString();
            }
            using (var newContext = _dbContext)
            {
                var user = newContext.Users.SingleOrDefault(u => u.Email == context.User.Identity.Name);
                if (user != null)
                {
                    var roles = newContext.Roles
                        .Where(r => r.Name == Role.Codes.KeyMaster || r.Name == Role.Codes.DepartmentalAdmin).ToList();
                    if (_securityService.IsInRoles(roles, team, user).Result)
                    {
                        context.Succeed(requirement);
                    }
                }

            }

            //context.Succeed(requirement);
            return Task.CompletedTask;
        }

    }
}

