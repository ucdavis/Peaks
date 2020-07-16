using Microsoft.AspNetCore.Authorization;

namespace Keas.Mvc.Attributes
{
    public class VerifyRoleOrAuthToken : IAuthorizationRequirement
    {
        public readonly string[] RoleStrings;

        public VerifyRoleOrAuthToken(params string[] roleStrings)
        {
            RoleStrings = roleStrings;
        }
    }
}
