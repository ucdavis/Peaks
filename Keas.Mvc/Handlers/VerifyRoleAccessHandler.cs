using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Attributes;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Keas.Mvc.Handlers
{
    public class VerifyRoleAccessHandler : AuthorizationHandler<VerifyRoleAccess>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ISecurityService _securityService;

        public VerifyRoleAccessHandler(ApplicationDbContext dbContext, ISecurityService securityService)
        {
            _dbContext = dbContext;
            _securityService = securityService;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, VerifyRoleAccess requirement)
        {
            string team = "";
            if (context.Resource is AuthorizationFilterContext mvcContext)
            {
                team = mvcContext.RouteData.Values["teamName"].ToString();
            }

            var user = _dbContext.Users.SingleOrDefault(u => u.Email == context.User.Identity.Name);
            if (user != null)
            {
                //var roles = _dbContext.Roles
                //    .Where(r => r.Name == Role.Codes.KeyMaster || r.Name == Role.Codes.DepartmentalAdmin).ToList();
                var roles = _dbContext.Roles.Where(r => requirement.RoleStrings.Contains(r.Name)).ToList();
                if (_securityService.IsInRoles(roles, team, user).Result)
                {
                    context.Succeed(requirement);
                }
            }
            return Task.CompletedTask;
        }
    }
}
