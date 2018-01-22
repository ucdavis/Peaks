using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Keas.Mvc
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<AuthSettings>(Configuration.GetSection("Authentication"));

            // setup services
            services.AddSingleton<IIdentityService, IdentityService>();
            
            // setup entity framework
            services.AddDbContextPool<ApplicationDbContext>(o => o.UseSqlite("Data Source=keas.db"));

            // add openID connect auth backed by a cookie signin scheme
            services.AddAuthentication(options =>
            {
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = OpenIdConnectDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie()
            .AddOpenIdConnect(options =>
            {
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.GetClaimsFromUserInfoEndpoint = true;
                options.ClientId = Configuration["Authentication:ClientId"];
                options.Authority = $"https://login.microsoftonline.com/{Configuration["Authentication:Tenant"]}";
                options.Events.OnRedirectToIdentityProvider = context =>
                {
                    // this allows us to go straight to the UCD login
                    context.ProtocolMessage.SetParameter("domain_hint", Configuration["Authentication:Domain"]);

                    return Task.FromResult(0);
                };
                options.Events.OnTokenValidated = async context =>
                {
                    var identity = (ClaimsIdentity) context.Principal.Identity;

                    // email comes across in upn claim
                    var email = identity?.FindFirst(ClaimTypes.Upn).Value;

                    if (string.IsNullOrWhiteSpace(email)) return;

                    var identityService = services.BuildServiceProvider().GetService<IIdentityService>();

                    var userId = await identityService.GetUserId(email);

                    if (string.IsNullOrWhiteSpace(userId))
                    {
                        throw new InvalidOperationException("Could not retrieve user information from IAM");
                    }

                    identity.RemoveClaim(identity.FindFirst(ClaimTypes.NameIdentifier));
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));

                    identity.AddClaim(new Claim(ClaimTypes.Email, email));
                };
            });

            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    // HotModuleReplacement = true,
                    // ReactHotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "TeamRoutes",
                    template: "{teamName}/{controller=Home}/{action=Index}/{id?}");

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
