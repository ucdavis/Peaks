using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
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
        private const string PeopleQuery = """
            query LivedNameUpdates($filter: PeopleFilterInput!) {
              people(filter: $filter) {
                results {
                  iam_id
                  name { lived_first_name lived_last_name lived_pronouns }
                  email { campus }
                }
                errors { parameter message }
              }
            }
            """;
        private readonly IClient _client;
        private readonly ApplicationDbContext _context;
        private readonly int _batchSize;

        public UpdateFromRosettaService(IClient client, ApplicationDbContext context, int? batchSize = null)
        {
            _batchSize = batchSize ?? 50;
            if (_batchSize <= 0)
                throw new ArgumentOutOfRangeException(nameof(batchSize), "LivedName:BatchSize must be greater than zero.");

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
                var people = await GetPeople(modifiedSince: $"{days}d", offset: offset);

                if (people.Length == 0)
                {
                    break;
                }

                count += await UpdateUsers(people);
                offset += people.Length;
                if (people.Length < _batchSize)
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
            foreach (var batch in userIamIds.Where(id => !string.IsNullOrWhiteSpace(id)).Chunk(_batchSize))
            {
                var people = await GetPeople(iamIds: batch, limit: batch.Length);

                // Ignore omitted identities and any unexpected records outside this batch.
                var requestedIds = batch.ToHashSet(StringComparer.Ordinal);
                count += await UpdateUsers(people
                    .Where(person => person != null && requestedIds.Contains(person.Iam_id)));
            }

            Log.Information("Rosetta full synchronization updated names or pronouns for {Count} users", count);
            return count;
        }

        private async Task<RosettaPerson[]> GetPeople(string modifiedSince = null, string[] iamIds = null,
            int offset = 0, int? limit = null)
        {
            var filter = new Dictionary<string, object>
            {
                ["affiliationState"] = "all",
                ["count"] = false,
                ["limit"] = limit ?? _batchSize,
                ["offset"] = offset
            };
            if (modifiedSince != null) filter["modifiedsince"] = modifiedSince;
            if (iamIds != null) filter["iamids"] = iamIds;

            var response = await _client.GraphqlAsync(new
            {
                query = PeopleQuery,
                variables = new { filter }
            });

            // GraphQL can return HTTP 200 with errors and partial data. Validate the
            // entire page before updating anyone; never treat a failed query as an empty page.
            if (response is not JsonElement root || root.ValueKind != JsonValueKind.Object)
                throw new InvalidOperationException("Rosetta returned an invalid GraphQL response.");
            ThrowIfGraphQlErrors(root);
            if (!root.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Object
                || !data.TryGetProperty("people", out var people) || people.ValueKind != JsonValueKind.Object)
                throw new InvalidOperationException("Rosetta GraphQL response is missing people data.");
            ThrowIfGraphQlErrors(people);
            if (!people.TryGetProperty("results", out var results) || results.ValueKind != JsonValueKind.Array)
                throw new InvalidOperationException("Rosetta GraphQL response is missing person results.");

            // Preserve null entries in the page length so offset pagination does not repeat rows.
            return results.EnumerateArray().Select(MapPerson).ToArray();
        }

        private static void ThrowIfGraphQlErrors(JsonElement result)
        {
            if (result.TryGetProperty("errors", out var errors) && errors.ValueKind != JsonValueKind.Null
                && (errors.ValueKind != JsonValueKind.Array || errors.GetArrayLength() > 0))
            {
                // API error text can contain identity data; keep it out of job logs.
                throw new InvalidOperationException("Rosetta GraphQL reported errors during lived-name synchronization.");
            }
        }

        private static RosettaPerson MapPerson(JsonElement person)
        {
            if (person.ValueKind == JsonValueKind.Null) return null;
            if (person.ValueKind != JsonValueKind.Object)
                throw new InvalidOperationException("Rosetta GraphQL returned an invalid person record.");

            // GraphQL names and emails are collections, while the existing REST models
            // and update workflow use a single name and email per person.
            return new RosettaPerson
            {
                Iam_id = person.TryGetProperty("iam_id", out var iamId) ? iamId.GetString() : null,
                Name = Records(person, "name").Select(record => record.Deserialize<Name>())
                    .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name.Lived_first_name)
                        && !string.IsNullOrWhiteSpace(name.Lived_last_name)),
                Email = Records(person, "email").Select(record => record.Deserialize<Email>())
                    .FirstOrDefault(email => !string.IsNullOrWhiteSpace(email.Campus))
            };
        }

        private static IEnumerable<JsonElement> Records(JsonElement person, string field)
        {
            if (!person.TryGetProperty(field, out var records) || records.ValueKind == JsonValueKind.Null)
                yield break;
            if (records.ValueKind != JsonValueKind.Array)
                throw new InvalidOperationException("Rosetta GraphQL returned an invalid name or email collection.");

            foreach (var record in records.EnumerateArray())
            {
                if (record.ValueKind == JsonValueKind.Null) continue;
                if (record.ValueKind != JsonValueKind.Object)
                    throw new InvalidOperationException("Rosetta GraphQL returned an invalid name or email record.");
                yield return record;
            }
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
