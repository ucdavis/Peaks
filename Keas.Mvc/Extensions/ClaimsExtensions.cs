using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

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
    }
}
