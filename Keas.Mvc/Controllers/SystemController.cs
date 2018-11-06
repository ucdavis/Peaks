using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    // [Authorize(Policy = "SystemAdminAccess")]
    public class SystemController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public SystemController(ApplicationDbContext context, IAuthenticationService authenticationService)
        {
            _context = context;
        }

#if DEBUG
        public IActionResult ResetDb()
        {
            DbInitializer.Initialize(_context);
            return Content("Success");
        }
#endif

        [HttpGet]
        [Authorize()]
        public IActionResult Emulate()
        {
            return View();
        }

        [HttpPost]
        [Authorize()]
        public async Task<IActionResult> Emulate(EmulateUserViewModel model)
        {
            //Log.Information("Emulation attempted for {username}", username);

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.UserEmail || u.Id == model.UserEmail);
            if (user == null)
            {
                return View(model);
            }

            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Id),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim("name", user.Name),
                new Claim(ClaimTypes.Email, user.Email)
            }, CookieAuthenticationDefaults.AuthenticationScheme);

            // kill old login
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // create new login
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

            return RedirectToAction("Index", "Home");
        }
    }
}
