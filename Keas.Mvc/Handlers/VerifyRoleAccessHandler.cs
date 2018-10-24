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
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Http;

namespace Keas.Mvc.Handlers
{
    public class VerifyRoleAccessHandler : AuthorizationHandler<VerifyRoleAccess>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ISecurityService _securityService;

        private readonly IHttpContextAccessor _httpContext;
        private readonly ITempDataDictionaryFactory _tempDataDictionaryFactory;

        public VerifyRoleAccessHandler(ApplicationDbContext dbContext, ISecurityService securityService, IHttpContextAccessor httpContext, ITempDataDictionaryFactory tempDataDictionary)
        {
            _dbContext = dbContext;
            _securityService = securityService;
             _httpContext = httpContext;
            _tempDataDictionaryFactory = tempDataDictionary;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, VerifyRoleAccess requirement)
        {
            string team = "";
            if (context.Resource is AuthorizationFilterContext mvcContext)
            {
                if (mvcContext.RouteData.Values["teamName"] != null)
                {
                    team = mvcContext.RouteData.Values["teamName"].ToString();
                }
            }  
            if (team == "") 
            {
                var tempData = _tempDataDictionaryFactory.GetTempData(_httpContext.HttpContext);                
                team = tempData["TeamName"].ToString();
            }         

            var user = _dbContext.Users.SingleOrDefault(u => u.Id == context.User.Identity.Name);
            var roles = await _dbContext.Roles.Where(r => requirement.RoleStrings.Contains(r.Name)).ToListAsync();
            if (user != null && team != "")
            {
                if (await _securityService.IsInRoles(roles, team, user))
                {
                    context.Succeed(requirement);
                }
            }
            if (user != null)
            {
                if (await _securityService.IsInAdminRoles(roles, user))
                {
                    context.Succeed(requirement);
                }
            }
        }
    }
}
