using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Handlers
{
    public class ApiKeyMiddleware
    {
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

            if (teamAccess == null)
            {
                return _next(context);
            }

            // make sure we have an API user ready to go for this team
            var apiPersonExists = dbContext.People.IgnoreQueryFilters().Any(p => p.UserId == ApiHelper.PeaksApiUser && p.TeamId == teamAccess.Id);

            if (!apiPersonExists)
            {
                // need to make sure our overall system-wide user exists
                if (!dbContext.Users.Any(u => u.Id == ApiHelper.PeaksApiUser))
                {
                    dbContext.Users.Add(new User
                    {
                        Id = ApiHelper.PeaksApiUser,
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
                    UserId = ApiHelper.PeaksApiUser
                };

                dbContext.People.Add(apiPerson);

                dbContext.SaveChanges();
            }

            // give the user a claim granting API access to given team  
            context.User.AddIdentity(new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(ApiHelper.ClaimName, teamAccess.Slug)
            }));

            return _next(context);
        }
    }
}
