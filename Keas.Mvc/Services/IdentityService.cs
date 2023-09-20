using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Ietws;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using ietws.PPSDepartment;
using Serilog;


namespace Keas.Mvc.Services
{
    public interface IIdentityService
    {
        Task<User> GetByEmail(string email);
        Task<User> GetByKerberos(string kerb);
        Task<string> BulkLoadPeople(string ppsCode, string teamslug, string actorName, string actorId);
        Task<PPSDepartmentResult> GetPpsDepartment(string ppsCode);

        Task<(Person Person, int peopleCount)> GetOrCreatePersonFromKerberos(string kerb, int teamId, Team team, string actorName, string actorId, string notes);
        Task<string> GetTitle(string iamId);
        Task<string> GetIamSupervisor(string iamId);
        Task<int> UpdateUsersFromLastModifiedDateInIam(DateTime modifiedAfterDate);
        Task<int> UpdateAllUsersFromIam();
    }

    public class IdentityService : IIdentityService
    {
        private readonly AuthSettings _authSettings;
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;


        public IdentityService(IOptions<AuthSettings> authSettings, ApplicationDbContext context, INotificationService notificationService)
        {
            _authSettings = authSettings.Value;
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<(Person Person, int peopleCount)> GetOrCreatePersonFromKerberos(string kerb, int teamId, Team team, string actorName, string actorId, string notes)
        {
            var user = await _context.Users.Include(u => u.People).IgnoreQueryFilters().Where(u => u.Id == kerb).FirstOrDefaultAsync();
            if (user == null)
            {
                //User does not exist, create, add to team
                user = await GetByKerberos(kerb);
                if (user != null)
                {
                    try
                    {
                        _context.Users.Add(user);
                        var person = await CreatePersonFromUser(user, teamId);
                        _context.People.Add(person);
                        await _context.SaveChangesAsync();
                        await _notificationService.PersonUpdated(person, team, team.Slug, actorName, actorId, PersonNotification.Actions.Added, notes);
                        await _context.SaveChangesAsync();
                        return (person, 1);
                    }
                    catch (Exception)
                    {
                        var local = _context.Set<User>()
                            .Local
                            .FirstOrDefault(entry => entry.Id == user.Id);

                        // check if local is not null 
                        if (local != null) // I'm using a extension method
                        {
                            // detach
                            _context.Entry(local).State = EntityState.Detached;
                        }

                        var localPerson = _context.Set<Person>().Local
                            .FirstOrDefault(entry => entry.UserId == user.Id);
                        if (localPerson != null) // I'm using a extension method
                        {
                            // detach
                            _context.Entry(localPerson).State = EntityState.Detached;
                        }

                        //No idea if this is correct... YOLO
                        var localNotification = _context.Set<PersonNotification>().Local.FirstOrDefault();
                        if (localNotification != null)
                        {
                            //detach
                            _context.Entry(localNotification).State = EntityState.Detached;
                        }

                        return (null, 0);
                    }
                }
                else
                {
                    // No user found, return null
                    return (null, 0);
                }
            }
            else
            {
                //User found. Check if in team, add if not
                var person = user.People.FirstOrDefault(p => p.TeamId == teamId);
                if (person != null)
                {
                    //Person already in team, activate if needed
                    if (!person.Active)
                    {
                        person.Active = true;
                        await _notificationService.PersonUpdated(person, team, team.Slug, actorName, actorId, PersonNotification.Actions.Reactivated, notes);
                        await _context.SaveChangesAsync();
                        return (person, 1);
                    }
                    return (person, 0);
                }
                else
                {
                    // Need to create person
                    person = await CreatePersonFromUser(user, teamId);
                    _context.People.Add(person);
                    await _context.SaveChangesAsync();
                    await _notificationService.PersonUpdated(person, team, team.Slug, actorName, actorId, PersonNotification.Actions.Added, notes);
                    await _context.SaveChangesAsync();
                    return (person, 1);
                }
            }
        }

        private async Task<Person> CreatePersonFromUser(User user, int teamId)
        {
            var person = new Person();
            person.User = user;
            person.FirstName = user.FirstName;
            person.LastName = user.LastName;
            person.Email = user.Email;
            person.Active = true;
            person.TeamId = teamId;
            person.Title = await GetTitle(user.Iam);
            return person;

        }

        public async Task<User> GetByEmail(string email)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            // get IAM from email
            var iamResult = await clientws.Contacts.Search(ContactSearchField.email, email);
            var iamId = iamResult.ResponseData.Results.Length > 0 ? iamResult.ResponseData.Results[0].IamId : string.Empty;
            if (string.IsNullOrWhiteSpace(iamId))
            {
                return null;
            }
            // return info for the user identified by this IAM 
            var result = await clientws.Kerberos.Search(KerberosSearchField.iamId, iamId);

            if (result.ResponseData.Results.Length > 0)
            {
                var ucdKerbPerson = result.ResponseData.Results.First();
                var user = CreateUser(email, ucdKerbPerson, iamId);
                return user;
            }
            return null;
        }

        private User CreateUser(string email, KerberosResult ucdKerbPerson, string iamId)
        {
            var user = new User()
            {
                FirstName = ucdKerbPerson.FirstName,
                LastName = ucdKerbPerson.LastName,
                Id = ucdKerbPerson.UserId,
                Email = email,
                Iam = iamId
            };
            return user;
        }

        public async Task<User> GetByKerberos(string kerb)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            var ucdKerbResult = await clientws.Kerberos.Search(KerberosSearchField.userId, kerb);

            if (ucdKerbResult.ResponseData.Results.Length == 0)
            {
                return null;
            }

            if (ucdKerbResult.ResponseData.Results.Length != 1)
            {
                var iamIds = ucdKerbResult.ResponseData.Results.Select(a => a.IamId).Distinct().ToArray();
                var userIDs = ucdKerbResult.ResponseData.Results.Select(a => a.UserId).Distinct().ToArray();
                if (iamIds.Length != 1 && userIDs.Length != 1)
                {
                    throw new Exception($"IAM issue with non unique values for kerbs: {string.Join(',', userIDs)} IAM: {string.Join(',', iamIds)}");
                }
            }

            var ucdKerbPerson = ucdKerbResult.ResponseData.Results.First();

            // find their email
            var ucdContactResult = await clientws.Contacts.Get(ucdKerbPerson.IamId);

            if (ucdContactResult.ResponseData.Results.Length == 0)
            {
                return null;
            }

            var ucdContact = ucdContactResult.ResponseData.Results.First();
            var rtValue = CreateUser(ucdContact.Email, ucdKerbPerson, ucdKerbPerson.IamId);

            if (string.IsNullOrWhiteSpace(rtValue.Email))
            {
                if (!string.IsNullOrWhiteSpace(ucdKerbPerson.UserId))
                {
                    rtValue.Email = $"{ucdKerbPerson.UserId}@ucdavis.edu";
                }
            }

            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(rtValue, new ValidationContext(rtValue), results);
            if (!isValid)
            {
                return null;
            }


            return rtValue;
        }

        public async Task<PPSDepartmentResult> GetPpsDepartment(string ppsCode)
        {
            var clientws = new IetClient(_authSettings.IamKey);
            var results = await clientws.PpsDepartment.Search(PPSDepartmentSearchField.deptCode, ppsCode);
            if (results.ResponseStatus != 0)
            {
                throw new Exception("Not successful");
            }

            if (results.ResponseData.Results.Length == 0)
            {
                return null;
            }

            return results.ResponseData.Results.FirstOrDefault();
        }

        public async Task<string> GetTitle(string iamId)
        {
            var title = string.Empty;
            try
            {
                var clientws = new IetClient(_authSettings.IamKey);
                var result = await clientws.PPSAssociations.Search(PPSAssociationsSearchField.iamId, iamId);
                if (result.ResponseData.Results.Length > 0)
                {
                    title = result.ResponseData.Results.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.titleOfficialName))?.titleOfficialName;
                }
            }
            catch (Exception ex)
            {
                Log.Error($"Getting Title for IamId: {iamId}.", ex);
            }

            return title;
        }

        public async Task<string> GetIamSupervisor(string iamId)
        {
            var iam = string.Empty;
            try
            {
                var clientws = new IetClient(_authSettings.IamKey);
                var result = await clientws.PPSAssociations.Search(PPSAssociationsSearchField.iamId, iamId);
                if (result.ResponseData.Results.Length > 0)
                {
                    iam = result.ResponseData.Results.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.reportsToIAMID))?.reportsToIAMID;
                }
            }
            catch (Exception ex)
            {
                Log.Error($"Getting SupervisorId for IamId: {iamId}.", ex);
            }

            return iam;
        }

        /// <summary>
        /// Note, this may or will contain IAM ids that do not exist in peaks.
        /// </summary>
        /// <param name="modifiedAfterDate"></param>
        /// <returns></returns>
        public async Task<int> UpdateUsersFromLastModifiedDateInIam(DateTime modifiedAfterDate)
        {
            var count = 0;
            try
            {
                var clientws = new IetClient(_authSettings.IamKey);
                var result = await clientws.People.Search(PeopleSearchField.modifyDateAfter, modifiedAfterDate.ToString("yyyy-MM-dd"));
                if (result.ResponseData.Results.Length > 0)
                {
                    var iamIds = result.ResponseData.Results.Select(a => a.IamId).ToList();

                    var batches = Batch(iamIds, 100);
                    foreach (var batch in batches)
                    {
                        var batchCount = 0;
                        var users = await _context.Users.Where(a => batch.Contains(a.Iam)).Include(a => a.People).ToListAsync();
                        foreach (var user in users)
                        {
                            var ietData = result.ResponseData.Results.Where(a => a.IamId == user.Iam).FirstOrDefault();
                            if (ietData != null)
                            {
                                if (user.FirstName != ietData.DFirstName || user.LastName != ietData.DLastName)
                                {
                                    count++;
                                    batchCount++;
                                    user.FirstName = ietData.DFirstName;
                                    user.LastName = ietData.DLastName;
                                    //user.pronouns = ietData.DPronouns; //if we add pronouns
                                    foreach (var person in user.People)
                                    {
                                        person.FirstName = ietData.DFirstName;
                                        person.LastName = ietData.DLastName;
                                    }
                                    Log.Information($"Updating {user.Iam} from Iam.");
                                }
                            }
                        }
                        if(batchCount > 0)
                        {
                            await _context.SaveChangesAsync();
                        }
                    }   


                    Log.Information($"Updating {count} users from Iam.");

                }
            }
            catch (Exception ex)
            {
                Log.Error($"Getting List of Users to Update.", ex);
            }
            return count;
        }

        /// <summary>
        /// Don't run this on prod during working hours.
        /// </summary>
        /// <returns></returns>
        public async Task<int> UpdateAllUsersFromIam()
        {
            Log.Information("UpdateAllUsersFromIam - Starting");
            var clientws = new IetClient(_authSettings.IamKey);
            //Take 100 users at a time and check them against IAM
            var count = 0;
            var currentBatch = 0;
            var userIamIds = await _context.Users.Where(a => a.Iam != null).Select(a => a.Iam).ToListAsync();
            var batches = Batch(userIamIds, 100);
            foreach (var batch in batches)
            {
                currentBatch++;
                Log.Information($"UpdateAllUsersFromIam - Starting batch number {currentBatch} .");
                var batchCount = 0;
                //Pause for 5 seconds to not overload IAM
                await Task.Delay(5000);

                var users = await _context.Users.Where(a => batch.Contains(a.Iam)).Include(a => a.People).ToListAsync();
                foreach (var user in users)
                {
                    var result = await clientws.People.Search(PeopleSearchField.iamId, user.Iam);
                    if (result != null && result.ResponseData.Results.Length > 0)
                    {
                        var ietData = result.ResponseData.Results.Where(a => a.IamId == user.Iam).FirstOrDefault();
                        if(ietData == null)
                        {
                            continue;
                        }

                        if (user.FirstName != ietData.DFirstName || user.LastName != ietData.DLastName)
                        {
                            count++;
                            batchCount++;
                            user.FirstName = ietData.DFirstName;
                            user.LastName = ietData.DLastName;
                            //user.pronouns = ietData.DPronouns; //if we add pronouns
                            foreach (var person in user.People)
                            {
                                person.FirstName = ietData.DFirstName;
                                person.LastName = ietData.DLastName;
                            }
                            Log.Information($"Updating {user.Iam} from Iam.");
                        }
                    }
                }
                if (batchCount > 0)
                {
                    Log.Information($"UpdateAllUsersFromIam - Updated {batchCount} users .");
                    await _context.SaveChangesAsync();
                }
            }

            
            Log.Information($"UpdateAllUsersFromIam - Updated total of {count} users .");
            

            return count;
        }

        private static IEnumerable<IEnumerable<TSource>> Batch<TSource>(IEnumerable<TSource> source, int size)
        {
            TSource[] bucket = null;
            var count = 0;

            foreach (var item in source)
            {
                if (bucket == null)
                    bucket = new TSource[size];

                bucket[count++] = item;
                if (count != size)
                    continue;

                yield return bucket;

                bucket = null;
                count = 0;
            }

            if (bucket != null && count > 0)
                yield return bucket.Take(count);
        }

        public async Task<string> BulkLoadPeople(string ppsCode, string teamslug, string actorName, string actorId)
        {
            int newpeople = 0;
            StringBuilder warning = new StringBuilder();
            var team = await _context.Teams.SingleAsync(t => t.Slug == teamslug);
            var clientws = new IetClient(_authSettings.IamKey);
            var iamIds = await clientws.PPSAssociations.GetIamIds(PPSAssociationsSearchField.adminDeptCode, ppsCode);

            foreach (var id in iamIds.ResponseData.Results)
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Iam == id.IamId);
                if (user == null)
                {
                    // User not found with IamId
                    var kerbResults = await clientws.Kerberos.Search(KerberosSearchField.iamId, id.IamId);

                    if (kerbResults.ResponseData.Results.Length > 0)
                    {
                        var personResult = await GetOrCreatePersonFromKerberos(kerbResults.ResponseData.Results[0].UserId, team.Id, team, actorName, actorId, $"Bulk Load from PPS code: {ppsCode}");
                        newpeople += personResult.peopleCount;
                        if (personResult.Person == null)
                        {
                            if (kerbResults.ResponseData.Results.Length > 0)
                            {
                                warning.Append($" Kerb Id: {kerbResults.ResponseData.Results.First().UserId} failed to save.");
                            }
                            else
                            {
                                warning.Append($" IAM ID {id.IamId} failed to save.");
                            }
                        }
                    }
                    else
                    {
                        //Try to get name for Iam Id 
                        var extraName = string.Empty;
                        try
                        {
                            var iamInfoResults = await clientws.People.Get(id.IamId);//  //.Kerberos.Search(KerberosSearchField.iamId, id.IamId);
                            if (iamInfoResults.ResponseData.Results.Length > 0)
                            {
                                extraName = $"({iamInfoResults.ResponseData.Results.First().OFullName}) ";
                            }
                        }
                        catch
                        {
                            // ignored
                        }

                        warning.Append($" IAM ID {id.IamId} {extraName}failed to save.");
                    }
                }
                else
                {
                    // User exists with IAM ID
                    var deactivaedPerson = await _context.People.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.User.Id == user.Id && a.Team.Id == team.Id);
                    if (deactivaedPerson != null && deactivaedPerson.Active)
                    {
                        //User is in team and active
                        continue;
                    }
                    if (deactivaedPerson != null && !deactivaedPerson.Active)
                    {
                        //User is in team, but deactivated
                        deactivaedPerson.Active = true;
                        await _notificationService.PersonUpdated(deactivaedPerson, team, teamslug, actorName, actorId, PersonNotification.Actions.Reactivated, $"Bulk Load from PPS code: {ppsCode}");
                    }
                    else
                    {
                        // User is not in team
                        var newPerson = new Person()
                        {
                            User = user,
                            Team = team,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            Email = user.Email,
                            Title = await GetTitle(user.Iam)
                        };
                        _context.People.Add(newPerson);
                        await _context.SaveChangesAsync(); //Need to save person so it has an id for notification below
                        await _notificationService.PersonUpdated(newPerson, team, teamslug, actorName, actorId, PersonNotification.Actions.Added, $"Bulk Load from PPS code: {ppsCode}");
                    }

                    newpeople += 1;
                }
            }
            await _context.SaveChangesAsync();
            string returnMessage = newpeople.ToString() + " new people added to the team. " + warning.ToString();
            return returnMessage;
        }

    }
}
