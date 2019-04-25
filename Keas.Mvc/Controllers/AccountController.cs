using System;
using System.Threading.Tasks;
using AspNetCore.Security.CAS;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Controllers
{
    public class AccountController : Controller
    {
        private readonly ITeamsManager _teamsManager;
        private readonly AuthSettings _AuthSettings;
        public AccountController(IOptions<AuthSettings> authSettings, ITeamsManager teamsManager)
        {
            _teamsManager = teamsManager;
            _AuthSettings = authSettings.Value;
        }
        public IActionResult AccessDenied()
        {
            return View();
        }

        [Route("logout")]
        public async Task<ActionResult> Login()
        {
            await HttpContext.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        [AllowAnonymous]
        [Route("login")]
        public async Task Login(string returnUrl)
        {
            var props = new AuthenticationProperties { RedirectUri = returnUrl };
            await HttpContext.ChallengeAsync(CasDefaults.AuthenticationScheme, props);
        }

        public async Task<IActionResult> Logout2() //There is a logout above, maybe used for emulation.
        {
            _teamsManager.ClearTeams();
            await HttpContext.SignOutAsync();           
            return Redirect($"{_AuthSettings.CasBaseUrl}logout");
        }
    }
}
