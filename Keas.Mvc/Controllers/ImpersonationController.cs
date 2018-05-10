using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    public class ImpersonationController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;

        public ImpersonationController(ApplicationDbContext context, IIdentityService identityService)
        {
            _context = context;
            _identityService = identityService;
        }

        public async Task<IActionResult> EmulateUser(string email)
        {
            var userId = await _identityService.GetUserId(email);

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new InvalidOperationException("Could not retrieve user information from IAM");
            }
            await HttpContext.SignOutAsync();

            var claims = new List<Claim>();
            claims.Add(new Claim(ClaimTypes.Name, userId));
            claims.Add(new Claim(ClaimTypes.Email, email));
            var id = new ClaimsIdentity(claims);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(id));
            //var identity = (ClaimsIdentity)HttpContext.User.Identity;

            //identity.RemoveClaim(identity.FindFirst(ClaimTypes.NameIdentifier));
            //identity.RemoveClaim(identity.FindFirst(ClaimTypes.Email));

            //identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));

            //identity.AddClaim(new Claim(ClaimTypes.Email, email));

            //await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            //    new ClaimsPrincipal(identity));
            Message = $"Signed in as {email}";

            return RedirectToAction("Index", "Home");

        }
    }
}