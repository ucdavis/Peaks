using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Ietws;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Keas.Mvc.Services
{
    public interface IFinancialService
    {
        Task<bool> ValidateFISOrg(string chart, string orgCode);
    }

    public class FinancialService : IFinancialService
    {
        private readonly KfsApiSettings _kfsApiSettings;

        public FinancialService(IOptions<KfsApiSettings> kfsApiSettings)
        {
            _kfsApiSettings = kfsApiSettings.Value;
        }

        public async Task<bool> ValidateFISOrg(string chart, string orgCode)
        {
            //https://kfs.ucdavis.edu/kfs-prd/api-docs/ //Documentation 
            // https://kfs.ucdavis.edu:443/kfs-prd/remoting/rest/org/6/xxxx/isvalid           
            
            string validationUrl = $"{_kfsApiSettings.FinancialLookupUrl}/org/{chart}/{orgCode}/isvalid";
            
            using (var client = new HttpClient())
            {
                var validationResponse = await client.GetAsync(validationUrl);
                validationResponse.EnsureSuccessStatusCode();

                var validationContents = await validationResponse.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<bool>(validationContents);
            }

        }
    }    
}