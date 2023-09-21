using System;
using System.IO;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Helper;
using Keas.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Keas.Core.Services;
using Keas.Jobs.Core;
using Serilog;
using Keas.Core.Extensions;

namespace Keas.Jobs.LivedName
{
    public class Program : JobBase
    {
        private static ILogger _log;

        static void Main(string[] args)
        {
            Configure();

            var assembyName = typeof(Program).Assembly.GetName();
            _log = Log.Logger
                .ForContext("jobname", assembyName.Name)
                .ForContext("jobid", Guid.NewGuid());

            _log.Information("Running {job} build {build}", assembyName.Name, assembyName.Version);

            // setup di
            var provider = ConfigureServices();


            UpdateLivedNames(provider);


        }

        private static void UpdateLivedNames(ServiceProvider provider)
        {
            Log.Information("Staring UpdateLivedNames");
            var updateService = provider.GetService<IUpdateFromIamService>();
            var count = updateService.UpdateUsersFromLastModifiedDateInIam(DateTime.UtcNow.AddDays(-1).ToPacificTime().Date).GetAwaiter().GetResult();
            Log.Information("Updated {count} users", count);
            Log.Information("Finished UpdateLivedNames");

        }

        private static ServiceProvider ConfigureServices()
        {
            IServiceCollection services = new ServiceCollection();
            services.AddOptions();
            services.AddDbContextPool<ApplicationDbContext>(o => o.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.Configure<IamAuthSettings>(Configuration.GetSection("Authentication"));

            services.AddTransient<IUpdateFromIamService, UpdateFromIamService>();

            return services.BuildServiceProvider();
        }
    }
}
