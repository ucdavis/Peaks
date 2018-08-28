using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Extensions
{
    public static class ClaimsExtensions
    {
        public static string GetNameClaim(this ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal == null || !claimsPrincipal.Identity.IsAuthenticated) return string.Empty;

            var nameClaim = claimsPrincipal.FindFirst("name");

            return nameClaim != null ? nameClaim.Value : claimsPrincipal.Identity.Name;
        }

        public static User GetUserInfo(this ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal == null || !claimsPrincipal.Identity.IsAuthenticated) return null;

            return new User
            {
                FirstName = claimsPrincipal.FindFirstValue(ClaimTypes.GivenName),
                LastName = claimsPrincipal.FindFirstValue(ClaimTypes.Surname),
                Email = claimsPrincipal.FindFirstValue(ClaimTypes.Email),
                Id = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)
            };
        }
    }
}
