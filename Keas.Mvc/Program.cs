using System;
using Keas.Core.Data;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Keas.Mvc
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = BuildWebHost(args);

            using (var scope = host.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var superuserSetting = scope.ServiceProvider.GetRequiredService<IOptions<SuperuserSettings>>();
                var dbInitilizer = new DbInitializer(dbContext, superuserSetting);
                dbInitilizer.Initialize();
            }

            host.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
