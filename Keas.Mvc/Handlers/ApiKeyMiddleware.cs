using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.AspNetCore.Http;

namespace Keas.Mvc.Handlers
{
    public class ApiKeyMiddleware {
        public const string HeaderKey = "X-Auth-Token";

        private readonly RequestDelegate _next;

        public ApiKeyMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public Task Invoke(HttpContext context, ApplicationDbContext dbContext)
        {
            // check for header
            if (!context.Request.Headers.ContainsKey(HeaderKey))
            {
                return _next(context);
            }
            var headerValue = context.Request.Headers[HeaderKey].FirstOrDefault();

            // lookup team that this API key has acess to
            var teamAccess = dbContext.Teams.FirstOrDefault(t => t.ApiCode == new Guid(headerValue));

            if (teamAccess == null) {
                return _next(context);
            }

            // give the user a claim granting API access to given team  
            context.User.AddIdentity(new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("APIKEYTEAM", teamAccess.Slug)
            }));

            return _next(context);
        }
    }
}
