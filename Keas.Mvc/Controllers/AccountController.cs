using System.Linq;
using System.Security.Claims;
using Keas.Core.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
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
    [ApiExplorerSettings(IgnoreApi = true)]
    public class AccountController : Controller
    {
        private readonly ITeamsManager _teamsManager;
        private readonly AuthSettings _AuthSettings;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private const string LocalLoginClaim = "peaks:local-login";
        private bool LocalLoginEnabled => _environment.IsDevelopment() && _configuration.GetValue<bool>("LocalLogin:Enabled");
        public AccountController(IOptions<AuthSettings> authSettings, ITeamsManager teamsManager,
            ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _teamsManager = teamsManager;
            _context = context;
            _configuration = configuration;
            _environment = environment;
            _AuthSettings = authSettings.Value;
        }
        public IActionResult AccessDenied()
        {
            return View();
        }

        [Route("logout")]
        public async Task<ActionResult> Login()
        {
            var localSession = User.HasClaim(LocalLoginClaim, "true");
            _teamsManager.ClearTeams();
            await HttpContext.SignOutAsync();
            return localSession ? Redirect("/login") : RedirectToAction("Index", "Home");
        }

        [AllowAnonymous]
        [HttpGet("login")]
        public IActionResult Login(string returnUrl, bool useCas = false)
        {
            var destination = Url.IsLocalUrl(returnUrl) ? returnUrl : "/";
            if (LocalLoginEnabled && !useCas)
                return View(new LocalLoginModel { ReturnUrl = destination });

            return Challenge(new AuthenticationProperties { RedirectUri = destination }, CasDefaults.AuthenticationScheme);
        }

        [AllowAnonymous]
        [HttpPost("login/local")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> LocalLogin(LocalLoginModel model)
        {
            if (!LocalLoginEnabled)
                return NotFound();

            model.ReturnUrl = Url.IsLocalUrl(model.ReturnUrl) ? model.ReturnUrl : "/";
            if (!ModelState.IsValid)
                return View("Login", model);

            var lookup = model.Login.Trim();
            // Email is not unique in the schema; ambiguous matches must not pick an identity.
            var matches = await _context.Users.AsNoTracking()
                .Where(u => u.Id == lookup || u.Email == lookup).Take(2).ToListAsync();
            if (matches.Count != 1)
            {
                ModelState.AddModelError(nameof(model.Login), "Enter a Kerberos ID or email that identifies one existing Peaks user.");
                return View("Login", model);
            }

            var user = matches[0];
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Id),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim("name", user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(LocalLoginClaim, "true")
            }, CookieAuthenticationDefaults.AuthenticationScheme);

            _teamsManager.ClearTeams();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
            return LocalRedirect(model.ReturnUrl);
        }

        public async Task<IActionResult> Logout2() //There is a logout above, maybe used for emulation.
        {
            var localSession = User.HasClaim(LocalLoginClaim, "true");
            _teamsManager.ClearTeams();
            await HttpContext.SignOutAsync();
            return Redirect(localSession ? "/login" : $"{_AuthSettings.CasBaseUrl}logout");
        }
    }
}
