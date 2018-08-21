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
        Task<string> GetUserId(string email);
        Task<User> GetUser(string id, string email);
        Task<User> GetByKerberos(string kerb);
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
            var clientws = new IetClient(_authSettings.IamKey);
            var result = await clientws.Contacts.Search(ContactSearchField.email, email);

            if (result.ResponseData.Results == null) return string.Empty;

            return result.ResponseData.Results.Length > 0 ? result.ResponseData.Results[0].IamId : String.Empty;
        }

        public async Task<User> GetUser(string id, string email)
        {
            // return info for the user identified by this email address in IAM
            var clientws = new IetClient(_authSettings.IamKey);
            var result = await clientws.People.Search(PeopleSearchField.iamId, id);

            if (result.ResponseData.Results.Length > 0)
            {
                var user = new User()
                {
                    FirstName = result.ResponseData.Results[0].OFirstName,
                    LastName = result.ResponseData.Results[0].OLastName,
                    Id = id,
                    Email = email
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
                Email = ucdContact.Email
            };
        }
    }    
}