using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Http;
using Keas.Mvc.Attributes;

namespace Keas.Mvc.Handlers
{
    public class VerifyRoleOrAuthTokenHandler : AuthorizationHandler<VerifyRoleOrAuthToken> {
        private readonly ITempDataDictionaryFactory _tempDataDictionaryFactory;
        private readonly IHttpContextAccessor _httpContext;

        public VerifyRoleOrAuthTokenHandler(IHttpContextAccessor httpContext, ITempDataDictionaryFactory tempDataDictionary)
        {
            _httpContext = httpContext;
            _tempDataDictionaryFactory = tempDataDictionary;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, VerifyRoleOrAuthToken requirement) {
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

            return Task.CompletedTask;
        }
    }
}
