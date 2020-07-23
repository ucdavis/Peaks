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
            // Work-around for catch-all bug in routing
            // See: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-3.1#route-template-reference
            AppContext.SetSwitch("Microsoft.AspNetCore.Routing.UseCorrectCatchAllBehavior", true);
            
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
