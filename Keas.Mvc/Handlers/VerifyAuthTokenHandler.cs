using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Http;
using Keas.Mvc.Attributes;
using Keas.Mvc.Services;
using Keas.Core.Domain;
using System.Linq;

namespace Keas.Mvc.Handlers
{
    public class VerifyRoleOrAuthTokenHandler : AuthorizationHandler<VerifyRoleOrAuthToken> {
        private readonly ISecurityService _securityService;
        private readonly ITempDataDictionaryFactory _tempDataDictionaryFactory;
        private readonly IHttpContextAccessor _httpContext;

        public VerifyRoleOrAuthTokenHandler(ISecurityService securityService, IHttpContextAccessor httpContext, ITempDataDictionaryFactory tempDataDictionary)
        {
            _securityService = securityService;
            _httpContext = httpContext;
            _tempDataDictionaryFactory = tempDataDictionary;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, VerifyRoleOrAuthToken requirement) {
            // get team name from url
            var team = "";
            if (context.Resource is AuthorizationFilterContext mvcContext)
            {
                if (mvcContext.RouteData.Values["teamName"] != null)
                {
                    team = mvcContext.RouteData.Values["teamName"].ToString();
                }
            }
            if (string.IsNullOrWhiteSpace(team))
            {
                var tempData = _tempDataDictionaryFactory.GetTempData(_httpContext.HttpContext);
                team = Convert.ToString(tempData["TeamName"]);
            }

            // user has access to team based on claims

            if (context.User.HasClaim("APIKEYTEAM", team)) {
                context.Succeed(requirement);
            }

            // TODO: if user doesn't have access based on claim/api key, check based on roles
            var userId = context.User.Identity.Name;

            if (await _securityService.IsInRoles(requirement.RoleStrings, team, userId))
            {
                context.Succeed(requirement);
                return;
            }


            if (requirement.RoleStrings.Contains(Role.Codes.Admin))
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
