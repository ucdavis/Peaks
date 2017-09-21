using System;
using System.Net.Http;
using System.Threading.Tasks;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Keas.Mvc.Services
{
    public interface IIdentityService
    {
        Task<string> GetUserId(string email);
    }

    public class IdentityService : IIdentityService
    {
        private readonly AuthSettings _authSettings;

        public IdentityService(IOptions<AuthSettings> authSettings)
        {
            _authSettings = authSettings.Value;
        }
        public async Task<string> GetUserId(string email)
        {
            // return info for the user identified by this email address in IAM
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://iet-ws.ucdavis.edu/api/iam/people/contactinfo/");
                var url = string.Format("search?key={0}&v=1.0&email={1}", _authSettings.IamKey, email);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var contents = await response.Content.ReadAsStringAsync();
                dynamic test = JsonConvert.DeserializeObject(contents);

                return test.responseData.results.Count > 0 ? test.responseData.results[0].iamId : string.Empty;
            }
        }
    }    
}