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
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Services
{
    public interface IIdentityService
    {
        Task<User> GetByEmail(string email);
        Task<User> GetByKerberos(string kerb);
        Task BulkLoadPeople(string ppsCode, string teamslug);
    }

    public class IdentityService : IIdentityService
    {
        private readonly AuthSettings _authSettings;
        private readonly ApplicationDbContext _context;

        public IdentityService(IOptions<AuthSettings> authSettings, ApplicationDbContext context)
        {
            _authSettings = authSettings.Value;
            _context = context;
        }

        public async Task<User> GetByEmail(string email)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            // get IAM from email
            var iamResult = await clientws.Contacts.Search(ContactSearchField.email, email);
            var iamId = iamResult.ResponseData.Results.Length > 0 ? iamResult.ResponseData.Results[0].IamId : String.Empty;
            if (String.IsNullOrWhiteSpace(iamId))
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

        public async Task BulkLoadPeople(string ppsCode, string teamslug)
        {
            var team = await _context.Teams.SingleAsync(t => t.Slug == teamslug);
            var clientws = new IetClient(_authSettings.IamKey);
            var iamIds = await clientws.PPSAssociations.GetIamIds(PPSAssociationsSearchField.deptCode, ppsCode);

            foreach (var id in iamIds.ResponseData.Results)
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Iam == id.IamId);
                if (user == null)
                {
                    // Need to add user and person
                    var peopleResults = await clientws.Kerberos.Get(id.IamId);
                    var contactResult = await clientws.Contacts.Get(id.IamId);

                    if (peopleResults.ResponseData.Results.Length > 0)
                    {
                        var newUser = new User()
                        {
                            FirstName = peopleResults.ResponseData.Results[0].DFirstName,
                            LastName = peopleResults.ResponseData.Results[0].DLastName,
                            Id = peopleResults.ResponseData.Results[0].UserId,
                            Email = contactResult.ResponseData.Results[0].Email,
                            Iam = id.IamId
                        };
                        _context.Users.Add(newUser);
                        var newPerson = new Person()
                        {
                            User = newUser,
                            Team = team
                        };
                        _context.People.Add(newPerson);
                        await _context.SaveChangesAsync();
                    }
                }
                else if (!await _context.People.AnyAsync(p => p.User.Iam == id.IamId))
                {
                    // User exists, but not in this team
                    var newPerson = new Person()
                    {
                        User = user,
                        Team = team
                    };
                    _context.People.Add(newPerson);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}