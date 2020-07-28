using System.Security.Claims;

namespace Keas.Mvc.Helpers
{
    public class ApiHelper {
        public static string ClaimName = "APIKEYTEAM";

        public static string PeaksApiUser = "api-peaks";

        public static bool isApiUser(ClaimsPrincipal user) {
            return user.HasClaim(c => c.Type == ClaimName);
        }
    }
}