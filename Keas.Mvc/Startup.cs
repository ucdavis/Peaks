using System;
using System.IO;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AspNetCore.Security.CAS;
using Elastic.Apm.NetCoreAll;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Handlers;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Keas.Mvc.Swagger;
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
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Serilog;
using SpaCliMiddleware;
using StackifyLib;

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
            services.AddHttpContextAccessor();

            services.Configure<AuthSettings>(Configuration.GetSection("Authentication"));
            services.Configure<KfsApiSettings>(Configuration.GetSection("KfsApi"));
            services.Configure<BigfixSettings>(Configuration.GetSection("Bigfix"));
            services.Configure<SuperuserSettings>(Configuration.GetSection("Superuser"));
            services.Configure<ApiSettings>(Configuration.GetSection("Api"));
            services.Configure<DocumentSigningSettings>(Configuration.GetSection("DocumentSigning"));

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

            services.AddSingleton<IConfigureOptions<CasOptions>, ConfigureCasOptions>();

            // add cas auth backed by a cookie signin scheme
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
                {
                    options.LoginPath = new PathString("/login");
                })
            .AddCAS();
            services.AddAuthorization(options =>
            {
                // Assets can be managed by role or auth token (API)
                options.AddPolicy(AccessCodes.Codes.EquipMasterAccess, policy => policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.EquipmentMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.KeyMasterAccess, policy => policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.KeyMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.AccessMasterAccess, policy=> policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.AccessMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.SpaceMasterAccess, policy=> policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.SpaceMaster,Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.DocumentMasterAccess, policy => policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.DocumentMaster, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.PersonManagerAccess, policy => policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.PersonManager, Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.AnyRole, policy => policy.Requirements.Add(new VerifyRoleOrAuthToken(Role.Codes.SpaceMaster, Role.Codes.DepartmentalAdmin, Role.Codes.AccessMaster, Role.Codes.DocumentMaster, Role.Codes.EquipmentMaster, Role.Codes.KeyMaster, Role.Codes.PersonManager)));

                // these require direct role access (no API access)
                options.AddPolicy(AccessCodes.Codes.DepartmentAdminAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.DepartmentalAdmin)));
                options.AddPolicy(AccessCodes.Codes.SystemAdminAccess, policy => policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.Admin)));
                options.AddPolicy(AccessCodes.Codes.DepartmentOrSystemAdminAccess, policy=> policy.Requirements.Add(new VerifyRoleAccess(Role.Codes.DepartmentalAdmin, Role.Codes.Admin)));
            });

            services.AddScoped<IAuthorizationHandler, VerifyRoleOrAuthTokenHandler>();
            services.AddScoped<IAuthorizationHandler, VerifyRoleAccessHandler>();
            
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<AutoValidateAntiforgeryTokenOrApiAuthorizationFilter>();

            //Added for Email Template View Engine
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddSingleton<ITempDataProvider, CookieTempDataProvider>();
            services.Configure<SparkpostSettings>(Configuration.GetSection("Sparkpost"));

            // Singleton allows authentication to be reused until expiration
            services.AddSingleton<IDocumentSigningService, DocumentSigningService>();

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
                .AddXmlSerializerFormatters()
                .AddNewtonsoftJson(options => {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "PEAKS API v1",
                    Version = "v1",
                    Description = "People Equipment Access Keys Space",
                    Contact = new OpenApiContact
                    {
                        Name = "Application Support",
                        Url = new Uri("https://caeshelp.ucdavis.edu/?appname=Peaks")
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT",
                        Url = new Uri("https://github.com/ucdavis/Peaks/blob/master/LICENSE")
                    },
                    Extensions =
                    {
                        { "ProjectUrl", new OpenApiString("https://github.com/ucdavis/Peaks/") }
                    }
                });

                var xmlFilePath = Path.Combine(AppContext.BaseDirectory, "Keas.Mvc.xml");
                c.IncludeXmlComments(xmlFilePath);

                var securityScheme = new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "ApiKey"
                    },
                    Type = SecuritySchemeType.ApiKey,
                    Description = "API Key Authentication",
                    Name = "X-Auth-Token", //ApiKeyMiddleware.HeaderKey,
                    In = ParameterLocation.Header,
                    Scheme = "ApiKey"
                };

                c.AddSecurityDefinition("ApiKey", securityScheme);

                c.OperationFilter<SecurityRequirementsOperationFilter>(securityScheme);
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory, IHostApplicationLifetime appLifetime)
        {
            app.UseAllElasticApm(Configuration);
            
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

            if (env.IsDevelopment())
            {
                // dist folder will be served by webpack-dev-server
                app.UseWhen(context => !context.Request.Path.StartsWithSegments("/dist"),
                    appBuilder => { appBuilder.UseStaticFiles(); });
            }
            else
            {
                app.UseStaticFiles();
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseSession();
            app.UseAuthentication();
            // Identity containing ApiKey does not get assigned to user if middleware is applied prior to authentication,
            // but it needs to come before authorization to make it available to authorization logic.
            app.UseMiddleware<ApiKeyMiddleware>();
            app.UseAuthorization();

            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Peaks API v1"));

            app.UseMiddleware<LogUserNameMiddleware>();
            app.UseSerilogRequestLogging();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers(); // map api controllers via attributes - necessary for being picked up by SwaggerGen

                if (env.IsDevelopment())
                {
                    endpoints.MapToSpaCliProxy(
                        "/dist/{*path}",
                        options: new SpaOptions {SourcePath = "wwwroot/dist"},
                        npmScript: "devpack",
                        port: 8080,
                        regex: "Project is running",
                        forceKill: true, // kill anything running on our webpack port
                        useProxy: true, // proxy webpack requests back through our aspnet server
                        runner: ScriptRunnerType.Npm
                    );
                }

                endpoints.MapControllerRoute(
                    name: "Assets",
                    pattern: "{teamName}/{asset}/{*type}",
                    defaults: new { controller = "Asset", action = "Index" },
                    constraints: new { asset = "(keys|keyserials|equipment|access|spaces|people|person|workstations)" }
                );

                endpoints.MapControllerRoute(
                    name: "NonTeamRoutes",
                    pattern: "{controller}/{action=Index}/{id?}",
                    defaults: null,
                    constraints: new { controller = "(admin|log)" }
                );

                endpoints.MapControllerRoute(
                    name: "GroupRoutes",
                    pattern: "{controller}/{action=Index}/{id?}",
                    defaults: null,
                    constraints: new {controller = "(group)"}
                );

                endpoints.MapControllerRoute(
                    name: "TeamRoutes",
                    pattern: "{teamName}/{controller=Home}/{action=Index}/{id?}");

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
    public class ConfigureCasOptions : IConfigureNamedOptions<CasOptions>
    {
        private readonly IServiceProvider _provider;

        public ConfigureCasOptions(IServiceProvider provider)
        {
            _provider = provider;
        }

        public void Configure(CasOptions o) => Configure("CAS", o);

        public void Configure(string name, CasOptions o)
        {
            o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            o.CasServerUrlBase = _provider.GetRequiredService<IOptions<AuthSettings>>().Value.CasBaseUrl;
            o.Events.OnTicketReceived = async context =>
            {
                var identity = (ClaimsIdentity)context.Principal.Identity;
                if (identity == null)
                {
                    return;
                }

                // kerb comes across in name & name identifier
                var kerb = identity?.FindFirst(ClaimTypes.NameIdentifier).Value;

                if (string.IsNullOrWhiteSpace(kerb)) return;

                User user = null;

                using (var scope = _provider.CreateScope())
                {
                    var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
                    user = await identityService.GetByKerberos(kerb);
                }

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
        }
    }
}
