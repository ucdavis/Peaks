using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Keas.Mvc.Helpers;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Logging;

namespace Keas.Mvc.Handlers {
    internal class AutoValidateAntiforgeryTokenOrApiAuthorizationFilter : IAsyncAuthorizationFilter, IAntiforgeryPolicy
    {
        private readonly IAntiforgery _antiforgery;
        private readonly ILogger _logger;

        public AutoValidateAntiforgeryTokenOrApiAuthorizationFilter(IAntiforgery antiforgery, ILoggerFactory loggerFactory)
        {
            if (antiforgery == null)
            {
                throw new ArgumentNullException(nameof(antiforgery));
            }

            _antiforgery = antiforgery;
            _logger = loggerFactory.CreateLogger<AutoValidateAntiforgeryTokenOrApiAuthorizationFilter>();
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (IsClosestAntiforgeryPolicy(context.Filters) && ShouldValidate(context))
            {
                try
                {
                    await _antiforgery.ValidateRequestAsync(context.HttpContext);
                }
                catch (AntiforgeryValidationException exception)
                {
                    _logger.LogInformation(new EventId(1, "AntiforgeryTokenInvalid"), exception, $"Antiforgery token validation failed. {exception.Message}");
                    context.Result = new BadRequestResult();
                }
            }
        }

        private bool ShouldValidate(AuthorizationFilterContext context)
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

        private bool IsClosestAntiforgeryPolicy(IList<IFilterMetadata> filters)
        {
            // Determine if this instance is the 'effective' antiforgery policy.
            for (var i = filters.Count - 1; i >= 0; i--)
            {
                var filter = filters[i];
                if (filter is IAntiforgeryPolicy)
                {
                    return object.ReferenceEquals(this, filter);
                }
            }

            Debug.Fail("The current instance should be in the list of filters.");
            return false;
        }
    }
}
