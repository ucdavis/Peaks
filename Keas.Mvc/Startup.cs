using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCore.Security.CAS;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Handlers;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using SpaCliMiddleware;
using StackifyLib;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace Keas.Mvc
{
    public class Startup
    {
        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsDevelopment())
            {
                builder.AddUserSecrets<Startup>();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
            Environment = env;
        }

        public IConfigurationRoot Configuration { get; }

        public IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<AuthSettings>(Configuration.GetSection("Authentication"));
            services.Configure<KfsApiSettings>(Configuration.GetSection("KfsApi"));
            services.Configure<BigfixSettings>(Configuration.GetSection("Bigfix"));
            services.Configure<SuperuserSettings>(Configuration.GetSection("Superuser"));

            // setup services
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<ISecurityService, SecurityService>();

            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromHours(1);
            });


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
                services.AddDbContextPool<ApplicationDbContext>(o =>
                {
                    // Temporarily open connection to enable "server-side" case-insensitive comparisons.
                    // As of EFCore 3.0 this is remembered for subsequent connections.
                    var connection = new SqliteConnection("Data Source=keas.db");
                    connection.Open();
                    connection.CreateCollation("NOCASE", (x, y) => string.Compare(x, y, ignoreCase: true));
                    connection.Close();

                    o.UseSqlite(connection);
                });
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
                    var identity = (ClaimsIdentity) context.Principal.Identity;
                    if (identity == null)
                    {
                        return;
                    }

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
                options.AddPolicy(AccessCodes.Codes.KeyMasterAccess, policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.KeyMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.EquipMasterAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.EquipmentMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.AccessMasterAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.AccessMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.SpaceMasterAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.SpaceMaster,Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.DepartmentAdminAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.AnyRole, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.SpaceMaster, Role.Codes.DepartmentalAdmin, Role.Codes.AccessMaster, Role.Codes.EquipmentMaster, Role.Codes.KeyMaster, Role.Codes.PersonManager)));
                options.AddPolicy(AccessCodes.Codes.SystemAdminAccess, policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.Admin)));
                options.AddPolicy(AccessCodes.Codes.DepartmentOrSystemAdminAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
                options.AddPolicy(AccessCodes.Codes.PersonManagerAccess, policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.PersonManager, Role.Codes.DepartmentalAdmin)));
            });
            services.AddScoped<IAuthorizationHandler, VerifyRoleAccessHandler>();
            
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            //Added for Email Template View Engine
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddSingleton<ITempDataProvider, CookieTempDataProvider>();
            services.Configure<SparkpostSettings>(Configuration.GetSection("Sparkpost"));

            services.AddScoped<IHistoryService, HistoryService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IEventService, EventService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFinancialService, FinancialService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<ITeamsManager, TeamsManager>();
            services.AddScoped<IBigfixService, BigfixService>();
            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0)
                .AddNewtonsoftJson(options => {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory, IHostApplicationLifetime appLifetime)
        {
            // setup logging
            LogConfiguration.Setup(Configuration);
            app.ConfigureStackifyLogging(Configuration);
            loggerFactory.AddSerilog();

            appLifetime.ApplicationStopped.Register(Log.CloseAndFlush);

            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseMiddleware<LogIdentityMiddleware>();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                // monitor in production
                app.UseMiddleware<StackifyMiddleware.RequestTracerMiddleware>();
                app.UseExceptionHandler("/Error/Index");
            }

            app.UseStatusCodePages("text/plain", "Status code page, status code: {0}");

            app.UseStaticFiles();
            app.UseRouting();
            app.UseSession();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(routes =>
            {
                routes.MapControllerRoute(
                    name: "API",
                    pattern: "api/{teamName}/{controller}/{action}/{id?}",
                    defaults: new { controller = "people", action = "Index" },
                    constraints: new { controller = "(keys|keyserials|equipment|access|spaces|people|person|workstations|tags|peopleAdmin)" }
                );

                routes.MapControllerRoute(
                    name: "Assets",
                    pattern: "{teamName}/{asset}/{*type}",
                    defaults: new { controller = "Asset", action = "Index" },
                    constraints: new { asset = "(keys|keyserials|equipment|access|spaces|people|person|workstations)" }
                );

                routes.MapControllerRoute(
                    name: "NonTeamRoutes",
                    pattern: "{controller}/{action=Index}/{id?}",
                    defaults: null,
                    constraints: new { controller = "(admin|log)" }
                );

                routes.MapControllerRoute(
                    name: "GroupRoutes",
                    pattern: "{controller}/{action=Index}/{id?}",
                    defaults: null,
                    constraints: new {controller = "(group)"}
                );

                routes.MapControllerRoute(
                    name: "TeamRoutes",
                    pattern: "{teamName}/{controller=Home}/{action=Index}/{id?}");

                routes.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                
                if (env.IsDevelopment())
                {
                    routes.MapToSpaCliProxy(
                        "{*path}",
                        options: new SpaOptions { SourcePath = "wwwroot/dist" },
                        npmScript: "devpack",
                        port: /*default(int)*/ 8080, // Allow webpack to find own port
                        regex: "Project is running",
                        forceKill: true, // kill anything running on our webpack port
                        useProxy: true, // proxy webpack requests back through our aspnet server
                        runner: ScriptRunnerType.Npm
                    );
                }
            });
        }
    }
}
