using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Handlers
{
    public class ApiKeyMiddleware
    {
        private const string InvalidApiKeyMessage = "Invalid Api Key";
        public const string HeaderKey = "X-Auth-Token";

        private readonly RequestDelegate _next;

        public ApiKeyMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task Invoke(HttpContext context, ApplicationDbContext dbContext, IOptions<ApiSettings> apiSettingsOptions)
        {
            var apiSettings = apiSettingsOptions.Value;

            // check for header
            if (!context.Request.Headers.ContainsKey(HeaderKey))
            {
                await _next(context);
                return;
            }

            var headerValue = context.Request.Headers[HeaderKey].FirstOrDefault();

            Guid headerGuidValue;

            if (!Guid.TryParse(headerValue, out headerGuidValue)) {
                // bad api key format, but just tell them it's unauthorized
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync(InvalidApiKeyMessage);
                return;
            }

            // lookup team that this API key has acess to
            var teamAccess = dbContext.Teams.Include(a => a.TeamApiCode).FirstOrDefault(a => a.TeamApiCode != null && a.TeamApiCode.ApiCode == headerGuidValue);
            if (teamAccess == null)
            {
                // no team found with your auth token, fail
                context.Response.StatusCode = 401; //UnAuthorized
                await context.Response.WriteAsync(InvalidApiKeyMessage);
                return;
            }

            // make sure we have an API user ready to go for this team
            var apiPersonExists = dbContext.People.IgnoreQueryFilters().Any(p => p.UserId == apiSettings.UserId && p.TeamId == teamAccess.Id);

            if (!apiPersonExists)
            {
                // need to make sure our overall system-wide user exists
                if (!dbContext.Users.Any(u => u.Id == apiSettings.UserId))
                {
                    dbContext.Users.Add(new User
                    {
                        Id = apiSettings.UserId,
                        Email = "api@peaks.ucdavis.edu",
                        FirstName = "API",
                        LastName = "PEAKS"
                    });
                }

                // create a new api person for this team, tied to the system-wide user
                var apiPersonName = teamAccess.Slug + "-api";

                var apiPerson = new Person
                {
                    Active = false,
                    Email = apiPersonName + "@peaks.ucdavis.edu",
                    FirstName = "",
                    LastName = apiPersonName,
                    TeamId = teamAccess.Id,
                    UserId = apiSettings.UserId
                };

                dbContext.People.Add(apiPerson);

                dbContext.SaveChanges();
            }

            // give the user a claim granting API access to given team  
            context.User.AddIdentity(new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(ApiHelper.ClaimName, teamAccess.Slug)
            }));

            await _next(context);
        }
    }
}
