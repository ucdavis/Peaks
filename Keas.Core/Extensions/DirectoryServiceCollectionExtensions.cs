using Keas.Core.Data;
using Keas.Core.Models;
using Keas.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UCD.Rosetta.Client.Core;
using UCD.Rosetta.Client.Core.Extensions;
using UCD.Rosetta.Client.Generated;

namespace Keas.Core.Extensions
{
    public static class DirectoryServiceCollectionExtensions
    {
        public static IServiceCollection AddDirectoryServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<IamAuthSettings>(configuration.GetSection("Authentication"));

            if (configuration.GetValue<bool>("FeatureFlags:UseRosetta"))
            {
                services.AddRosettaClientWithFactory(options => configuration.GetSection("RosettaClient").Bind(options));
                services.AddScoped<IClient>(provider => provider.GetRequiredService<RosettaClient>().Api);
                services.AddScoped<IUpdateFromIamService>(provider => new UpdateFromRosettaService(
                    provider.GetRequiredService<IClient>(), provider.GetRequiredService<ApplicationDbContext>(),
                    configuration.GetValue<int?>("LivedName:BatchSize")));
            }
            else
            {
                services.AddScoped<IUpdateFromIamService, UpdateFromIamService>();
            }

            return services;
        }
    }
}
