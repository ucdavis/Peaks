using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Keas.Mvc.Swagger
{
    public class SecurityRequirementsOperationFilter : IOperationFilter
    {
        private readonly IOptions<AuthorizationOptions> _authorizationOptions;
        private readonly OpenApiSecurityScheme _securityScheme;

        public SecurityRequirementsOperationFilter(IOptions<AuthorizationOptions> authorizationOptions, OpenApiSecurityScheme securityScheme)
        {
            _authorizationOptions = authorizationOptions;
            _securityScheme = securityScheme;
        }

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Policy names map to scopes
            var requiredScopes = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AuthorizeAttribute>()
                .Select(attr => attr.Policy)
                .Concat(context.MethodInfo.DeclaringType
                    .GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>()
                    .Select(attr => attr.Policy))
                .Distinct()
                .ToList();

            if (!requiredScopes.Any()) return;

            operation.Responses.Add("401", new OpenApiResponse { Description = "Unauthorized" });
            operation.Responses.Add("403", new OpenApiResponse { Description = "Forbidden" });

            if (operation.Security == null)
            {
                operation.Security = new List<OpenApiSecurityRequirement>();
            }
            operation.Security.Add(new OpenApiSecurityRequirement { { _securityScheme, requiredScopes } });


            if (operation.Parameters == null)
            {
                operation.Parameters = new List<OpenApiParameter>();
            }

            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "X-Auth-Token", //ApiKeyMiddleware.HeaderKey,
                In = ParameterLocation.Header,
                Description = "access token",
                Required = true,
                Schema = new OpenApiSchema
                {
                    Type = "string",
                    Default = new OpenApiString("ApiKey"),
                }
            });
        }
    }

}
