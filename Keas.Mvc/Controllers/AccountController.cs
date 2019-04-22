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
        private readonly IRolesSessionsManager _rolesSessionsManager;
        private readonly ITeamSessionManager _teamSessionManager;
        private readonly AuthSettings _AuthSettings;
        public AccountController(IOptions<AuthSettings> authSettings, IRolesSessionsManager rolesSessionsManager, ITeamSessionManager teamSessionManager)
        {
            _rolesSessionsManager = rolesSessionsManager;
            _teamSessionManager = teamSessionManager;
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
            _rolesSessionsManager.ClearSessionRoles();
            _teamSessionManager.ClearSessionRoles();
            await HttpContext.SignOutAsync();           
            return Redirect($"{_AuthSettings.CasBaseUrl}logout");
        }
    }
}
