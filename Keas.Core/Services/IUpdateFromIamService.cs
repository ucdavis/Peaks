using Keas.Core.Data;
using Keas.Core.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ietws;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Keas.Core.Services
{
    public interface IUpdateFromIamService
    {
        Task<int> UpdateUsersFromLastModifiedDateInIam(DateTime modifiedAfterDate);
        Task<int> UpdateAllUsersFromIam();
    }

    public class UpdateFromIamService : IUpdateFromIamService
    {
        private readonly IamAuthSettings _authSettings;
        private readonly ApplicationDbContext _context;

        public UpdateFromIamService(IOptions<IamAuthSettings> authSettings, ApplicationDbContext context)
        {
            _authSettings = authSettings.Value;
            _context = context;
        }

        /// <summary>
        /// Note, this may or will contain IAM ids that do not exist in peaks.
        /// </summary>
        /// <param name="modifiedAfterDate"></param>
        /// <returns></returns>
        public async Task<int> UpdateUsersFromLastModifiedDateInIam(DateTime modifiedAfterDate)
        {
            var count = 0;
            var emailCount = 0;
            try
            {
                Log.Information($"Update IAM by Modified Date - Starting for date {modifiedAfterDate}");
                var clientws = new IetClient(_authSettings.IamKey);
                var result = await clientws.People.Search(PeopleSearchField.modifyDateAfter, modifiedAfterDate.ToString("yyyy-MM-dd"));
                Log.Information($"Update IAM by Modified Date - Number Changed: {result.ResponseData.Results.Length}");
                if (result.ResponseData.Results.Length > 0)
                {
                    var iamIds = result.ResponseData.Results.Select(a => a.IamId).ToList();

                    var batches = Batch(iamIds, 100);
                    foreach (var batch in batches)
                    {
                        var batchCount = 0;
                        var emailBatchCount = 0;
                        var users = await _context.Users.Where(a => batch.Contains(a.Iam)).Include(a => a.People).ToListAsync();
                        foreach (var user in users)
                        {
                            var ietData = result.ResponseData.Results.Where(a => a.IamId == user.Iam).FirstOrDefault();
                            //Possible to get null data back for a user. Probably because they are going away
                            if (ietData != null && !string.IsNullOrWhiteSpace(ietData.DFirstName) && !string.IsNullOrWhiteSpace(ietData.DLastName))
                            {
                                if (user.FirstName != ietData.DFirstName || user.LastName != ietData.DLastName || user.Pronouns != ietData.DPronouns)
                                {
                                    count++;
                                    batchCount++;
                                    user.FirstName = ietData.DFirstName;
                                    user.LastName = ietData.DLastName;
                                    user.Pronouns = ietData.DPronouns;
                                    foreach (var person in user.People)
                                    {
                                        person.FirstName = ietData.DFirstName;
                                        person.LastName = ietData.DLastName;
                                    }
                                    Log.Information($"Update IAM by Modified Date - Updating {user.Iam} from Iam.");
                                }

                                //The only value we know about for email from this query is the person.CampusEmail This is probably the best one to use anyway.
                                if(!string.IsNullOrWhiteSpace(ietData.CampusEmail) && user.Email != ietData.CampusEmail)
                                {
                                    user.Email = ietData.CampusEmail;
                                    emailCount++;
                                    emailBatchCount++;
                                    Log.Information($"Update IAM by Modified Date - Updating {user.Iam} email from Iam.");
                                }
                            }
                        }
                        if (batchCount > 0 || emailBatchCount > 0)
                        {
                            await _context.SaveChangesAsync();
                        }
                    }


                    Log.Information($"Update IAM by Modified Date - Updating {count} users from Iam. And updating {emailCount} emails");

                }
            }
            catch (Exception ex)
            {
                Log.Error("Update IAM by Modified Date - Getting List of Users to Update.", ex);
                Log.Error($"Update IAM by Modified Date - Exception Message: {ex.Message} -- {ex.InnerException.Message}");
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
                        if (ietData == null || string.IsNullOrWhiteSpace(ietData.DFirstName) || string.IsNullOrWhiteSpace(ietData.DLastName))
                        {
                            continue;
                        }

                        if (user.FirstName != ietData.DFirstName || user.LastName != ietData.DLastName || user.Pronouns != ietData.DPronouns)
                        {
                            count++;
                            batchCount++;
                            user.FirstName = ietData.DFirstName;
                            user.LastName = ietData.DLastName;
                            user.Pronouns = ietData.DPronouns;
                            foreach (var person in user.People)
                            {
                                person.FirstName = ietData.DFirstName;
                                person.LastName = ietData.DLastName;
                            }
                            Log.Information($"Updating {user.Iam} from Iam.");
                        }
                        if(!string.IsNullOrWhiteSpace(ietData.CampusEmail) && user.Email != ietData.CampusEmail)
                        {
                            user.Email = ietData.CampusEmail;
                            Log.Information($"Updating {user.Iam} email from Iam.");
                        }
                        if (string.IsNullOrWhiteSpace(ietData.CampusEmail))
                        {
                            //Investigate these
                            Log.Warning($"Missing CampusEmail IAM: {user.Iam}");
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
    }
}
