﻿using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Keas.Mvc.Services
{
    public interface IIdentityService
    {
        Task<string> GetUserId(string email);
        Task<User> GetUser(string id);
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
                dynamic results = JsonConvert.DeserializeObject(contents);

                if (results.responseData.results == null) return string.Empty;
                
                return results.responseData.results.Count > 0 ? results.responseData.results[0].iamId : string.Empty;
            }
        }

        public async Task<User> GetUser(string id)
        {
            // return info for the user identified by this email address in IAM
            using (var client = new HttpClient())
            {
                
                client.BaseAddress = new Uri("https://iet-ws.ucdavis.edu/api/iam/people/");
                var url = string.Format("search?key={0}&v=1.0&iamId={1}", _authSettings.IamKey, id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var contents = await response.Content.ReadAsStringAsync();
                dynamic results = JsonConvert.DeserializeObject(contents);

                if (results.responseData.results.Count > 0)
                {
                    var user = new User()
                    {
                        FirstName= results.responseData.results[0].oFirstName,
                        LastName = results.responseData.results[0].oLastName,
                        Name = results.responseData.results[0].dFullName
                    };
                    return user;
                }
                return null;
                //if (results.responseData.results == null) return string.Empty;

                //return results.responseData.results.Count > 0 ? results.responseData.results[0].iamId : string.Empty;
            }
        }
    }    
}