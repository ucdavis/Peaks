using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCore.Security.CAS;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Handlers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
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
            services.Configure<KfsApiSettings>(Configuration.GetSection("KfsApi"));

            // setup services
            services.AddSingleton<IIdentityService, IdentityService>();
            services.AddScoped<ISecurityService, SecurityService>();


            // setup entity framework
            if (Configuration.GetSection("Dev:UseSql").Value == "Yes")
            {
                services.AddDbContextPool<ApplicationDbContext>(o =>
                {
                    o.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
#if DEBUG
                    o.EnableSensitiveDataLogging();
#endif
                });
            }
            else
            {
                services.AddDbContextPool<ApplicationDbContext>(o => o.UseSqlite("Data Source=keas.db"));
            }

            

            // add cas auth backed by a cookie signin scheme
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
                {
                    options.LoginPath = new PathString("/login");
                })
            .AddCAS(options => {
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.CasServerUrlBase = Configuration["Authentication:CasBaseUrl"];
                options.Events.OnTicketReceived = async context => { 
                    var c = context;

                    var identity = (ClaimsIdentity) context.Principal.Identity;

                    // kerb comes across in name & name identifier
                    var kerb = identity?.FindFirst(ClaimTypes.NameIdentifier).Value;

                    if (string.IsNullOrWhiteSpace(kerb)) return;

                    var identityService = services.BuildServiceProvider().GetService<IIdentityService>();

                    var user = await identityService.GetByKerberos(kerb);

                    if (user == null)
                    {
                        throw new InvalidOperationException("Could not retrieve user information from IAM");
                    }

                    identity.RemoveClaim(identity.FindFirst(ClaimTypes.NameIdentifier));
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));

                    identity.RemoveClaim(identity.FindFirst(ClaimTypes.Name));
                    identity.AddClaim(new Claim(ClaimTypes.Name, user.Id));

                    identity.AddClaim(new Claim(ClaimTypes.GivenName, user.FirstName));
                    identity.AddClaim(new Claim(ClaimTypes.Surname, user.LastName));
                    identity.AddClaim(new Claim("name", user.Name));
                    identity.AddClaim(new Claim(ClaimTypes.Email, user.Email));

                    await Task.FromResult(0); 
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("KeyMasterAccess", policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.KeyMaster, Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy("EquipMasterAccess", policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.EquipmentMaster, Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy("AccessMasterAccess", policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.AccessMaster, Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy("SpaceMasterAccess", policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.SpaceMaster,Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy("DepartmentAdminAccess", policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy("AnyRole", policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.SpaceMaster, Role.Codes.Admin, Role.Codes.DepartmentalAdmin, Role.Codes.AccessMaster, Role.Codes.EquipmentMaster, Role.Codes.KeyMaster)));
                options.AddPolicy("SystemAdminAccess", policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.Admin)));
            });
            services.AddScoped<IAuthorizationHandler, VerifyRoleAccessHandler>();
            
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            //Added for Email Template View Engine
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddSingleton<ITempDataProvider, CookieTempDataProvider>();
            services.Configure<EmailSettings>(Configuration.GetSection("Email"));

            services.AddScoped<IHistoryService, HistoryService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IEventService, EventService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFinancialService, FinancialService>();
            services.AddMvc().AddJsonOptions(options => {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    //HotModuleReplacement = true,
                    //ReactHotModuleReplacement = true
                });
            }
            else
            {
                // TODO: don't use dev exception
                app.UseDeveloperExceptionPage();

                // monitor in production
                app.UseMiddleware<StackifyMiddleware.RequestTracerMiddleware>();
                // app.UseExceptionHandler("/Error/Index");
            }
            app.UseStatusCodePages("text/plain", "Status code page, status code: {0}");



            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "API",
                    template: "api/{teamName}/{controller}/{action}/{id?}",
                    defaults: new { controller = "people", action = "Index" },
                    constraints: new { controller = "(keys|keyserials|equipment|access|spaces|people|person|workstations|tags)" }
                );

                routes.MapRoute(
                    name: "Assets",
                    template: "{teamName}/{asset}/{*type}",
                    defaults: new { controller = "Asset", action = "Index" },
                    constraints: new { asset = "(keys|keyserials|equipment|access|spaces|people|person|workstations)" }
                );

                routes.MapRoute(
                    name: "AdminRoutes",
                    template: "admin/{action=Index}/{id?}",
                    defaults: new { controller = "Admin" }
                );

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
