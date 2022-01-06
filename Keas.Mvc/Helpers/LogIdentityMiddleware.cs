using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Serilog.Context;

namespace Keas.Mvc.Helpers
{
    public class LogIdentityMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;

        public LogIdentityMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
        {
            _next = next;
            _logger = loggerFactory.CreateLogger<LogIdentityMiddleware>();
        }

        public async Task Invoke(HttpContext context)
        {
            var user = context.User.Identity.Name ?? "anonymous";

            using (_logger.BeginScope(new Dictionary<string, object>()
            {
                { "User", user }
            }))
            {
                await _next(context);
            }
        }
    }
}
