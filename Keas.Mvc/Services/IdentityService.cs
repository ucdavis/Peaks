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
    public interface IIdentityService
    {
        Task<User> GetByEmail(string email);
        Task<User> GetByKerberos(string kerb);
    }

    public class IdentityService : IIdentityService
    {
        private readonly AuthSettings _authSettings;

        public IdentityService(IOptions<AuthSettings> authSettings)
        {
            _authSettings = authSettings.Value;
        }

        public async Task<User> GetByEmail(string email)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            // get IAM from email
            var iamResult = await clientws.Contacts.Search(ContactSearchField.email, email);
            var iamId = iamResult.ResponseData.Results.Length > 0 ? iamResult.ResponseData.Results[0].IamId : String.Empty;
            if(String.IsNullOrWhiteSpace(iamId))
            {
                return null;
            } 
            // return info for the user identified by this IAM 
            var result = await clientws.Kerberos.Search(KerberosSearchField.iamId, iamId);

            if (result.ResponseData.Results.Length > 0)
            {
                var user = new User()
                {
                    FirstName = result.ResponseData.Results[0].DFirstName,
                    LastName = result.ResponseData.Results[0].DLastName,
                    Id = result.ResponseData.Results[0].UserId,
                    Email = email,
                    Iam = iamId
                };
                return user;
            }
            return null;
        }

        public async Task<User> GetByKerberos(string kerb)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            var ucdKerbResult = await clientws.Kerberos.Search(KerberosSearchField.userId, kerb);
            
            if (ucdKerbResult.ResponseData.Results.Length == 0)
            {
                return null;
            }

            var ucdKerbPerson = ucdKerbResult.ResponseData.Results.Single();

            // find their email
            var ucdContactResult = await clientws.Contacts.Get(ucdKerbPerson.IamId);
            
            var ucdContact = ucdContactResult.ResponseData.Results.First();

            return new User()
            {
                FirstName = ucdKerbPerson.DFirstName,
                LastName = ucdKerbPerson.DLastName,
                Id = ucdKerbPerson.UserId,
                Email = ucdContact.Email,
                Iam = ucdKerbPerson.IamId
            };
        }
    }    
}