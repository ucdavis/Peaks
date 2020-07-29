using System;
using Keas.Mvc.Helpers;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.Logging;

namespace Keas.Mvc.Handlers {
    internal class AutoValidateAntiforgeryTokenOrApiAuthorizationFilter : ValidateAntiforgeryTokenAuthorizationFilter
    {
        public AutoValidateAntiforgeryTokenOrApiAuthorizationFilter(IAntiforgery antiforgery, ILoggerFactory loggerFactory)
            : base(antiforgery, loggerFactory)
        {
        }

        protected override bool ShouldValidate(AuthorizationFilterContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var method = context.HttpContext.Request.Method;
            if (HttpMethods.IsGet(method) ||
                HttpMethods.IsHead(method) ||
                HttpMethods.IsTrace(method) ||
                HttpMethods.IsOptions(method))
            {
                return false;
            }

            // don't validate if the user in an API
            if (ApiHelper.isApiUser(context.HttpContext.User))
            {
                return false;
            }

            // Anything else requires a token.
            return true;
        }
    }
}