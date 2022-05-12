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
using Microsoft.AspNetCore.Routing;

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
            // get team name from url
            var team = "";
            if (_httpContext.HttpContext.Request != null)
            {
                team = _httpContext.HttpContext.Request.RouteValues["teamName"]?.ToString() ?? "";
            }
            
            if (string.IsNullOrWhiteSpace(team))
            {
                var tempData = _tempDataDictionaryFactory.GetTempData(_httpContext.HttpContext);
                team = tempData["TeamName"]?.ToString() ?? "";
            }

            var userId = context.User.Identity.Name;

            if (await _securityService.IsInRoles(requirement.RoleStrings, team, userId)) {
                context.Succeed(requirement);
                return;
            }


            if(requirement.RoleStrings.Contains(Role.Codes.Admin))
            {
                if (await _securityService.IsInAdminRoles(requirement.RoleStrings, userId))
                {
                    context.Succeed(requirement);
                    return;
                }
            }
            
        }
    }
}
