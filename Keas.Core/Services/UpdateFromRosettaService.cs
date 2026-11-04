using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;
using UCD.Rosetta.Client.Generated;
using RosettaPerson = UCD.Rosetta.Client.Generated.Person;

namespace Keas.Core.Services
{
    public class UpdateFromRosettaService : IUpdateFromIamService
    {
        private const int BatchSize = 100;
        private readonly IClient _client;
        private readonly ApplicationDbContext _context;

        public UpdateFromRosettaService(IClient client, ApplicationDbContext context)
        {
            _client = client;
            _context = context;
        }

        public async Task<int> UpdateUsersFromLastModifiedDateInIam(DateTime modifiedAfterDate)
        {
            // Rosetta accepts relative intervals, while the job supplies a Pacific calendar
            // date. Include an extra day so the rolling UTC window covers that entire date.
            var days = Math.Max(1, (int)(DateTime.UtcNow.Date - modifiedAfterDate.Date).TotalDays + 1);
            if (days > 999)
            {
                return await UpdateAllUsersFromIam();
            }

            var count = 0;
            var offset = 0;
            while (true)
            {
                var people = await _client.PeopleGETAsync(
                    modifiedsince: $"{days}d",
                    count: false,
                    limit: BatchSize,
                    offset: offset,
                    affiliationState: AffiliationState.All);

                if (people == null || people.Count == 0)
                {
                    break;
                }

                count += await UpdateUsers(people);
                offset += people.Count;
                if (people.Count < BatchSize)
                {
                    break;
                }
            }

            Log.Information("Rosetta incremental synchronization updated names or pronouns for {Count} users", count);
            return count;
        }

        public async Task<int> UpdateAllUsersFromIam()
        {
            var userIamIds = await _context.Users
                .Where(user => user.Iam != null)
                .Select(user => user.Iam)
                .Distinct()
                .ToListAsync();

            var count = 0;
            foreach (var batch in userIamIds.Where(id => !string.IsNullOrWhiteSpace(id)).Chunk(BatchSize))
            {
                var people = await _client.PeoplePOSTAsync(new PeoplePostRequest
                {
                    Iamids = batch,
                    Count = false,
                    Limit = batch.Length,
                    Offset = 0
                });

                // Ignore omitted identities and any unexpected records outside this batch.
                var requestedIds = batch.ToHashSet(StringComparer.Ordinal);
                count += await UpdateUsers((people ?? Array.Empty<RosettaPerson>())
                    .Where(person => person != null && requestedIds.Contains(person.Iam_id)));
            }

            Log.Information("Rosetta full synchronization updated names or pronouns for {Count} users", count);
            return count;
        }

        private async Task<int> UpdateUsers(IEnumerable<RosettaPerson> people)
        {
            var peopleByIam = people
                .Where(person => person != null && !string.IsNullOrWhiteSpace(person.Iam_id)
                    && !string.IsNullOrWhiteSpace(person.Name?.Lived_first_name)
                    && !string.IsNullOrWhiteSpace(person.Name?.Lived_last_name))
                .GroupBy(person => person.Iam_id, StringComparer.Ordinal)
                .ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal);

            if (peopleByIam.Count == 0)
            {
                return 0;
            }

            var iamIds = peopleByIam.Keys.ToArray();
            var users = await _context.Users
                .Where(user => iamIds.Contains(user.Iam))
                .Include(user => user.People)
                .ToListAsync();

            var count = 0;
            var changed = false;
            foreach (var user in users)
            {
                var person = peopleByIam[user.Iam];
                var name = person.Name;
                if (user.FirstName != name.Lived_first_name || user.LastName != name.Lived_last_name
                    || user.Pronouns != name.Lived_pronouns)
                {
                    user.FirstName = name.Lived_first_name;
                    user.LastName = name.Lived_last_name;
                    user.Pronouns = name.Lived_pronouns;
                    foreach (var teamPerson in user.People.Where(teamPerson => teamPerson.Active))
                    {
                        teamPerson.FirstName = name.Lived_first_name;
                        teamPerson.LastName = name.Lived_last_name;
                    }

                    count++;
                    changed = true;
                }

                if (!string.IsNullOrWhiteSpace(person.Email?.Campus) && user.Email != person.Email.Campus)
                {
                    user.Email = person.Email.Campus;
                    changed = true;
                }
            }

            if (changed)
            {
                await _context.SaveChangesAsync();
            }

            return count;
        }
    }
}
