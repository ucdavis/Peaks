using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Keas.Mvc.Attributes
{
    public class VerifyRoleAccess : IAuthorizationRequirement
    {
        public readonly string[] RoleStrings;

        public VerifyRoleAccess(params string[] roleStrings)
        {
            RoleStrings = roleStrings;
        }
    }
}
