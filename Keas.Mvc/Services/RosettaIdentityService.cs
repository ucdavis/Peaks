using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ietws.PPSDepartment;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Serilog;
using UCD.Rosetta.Client.Generated;
using RosettaPerson = UCD.Rosetta.Client.Generated.Person;

namespace Keas.Mvc.Services
{
    public class RosettaIdentityService : IdentityService
    {
        private const int PageSize = 100;
        private readonly IClient _client;
        private readonly ApplicationDbContext _context;
        private readonly Dictionary<string, RosettaPerson> _peopleByIam = new(StringComparer.OrdinalIgnoreCase);
        private readonly Dictionary<string, RosettaPerson> _peopleByKerberos = new(StringComparer.OrdinalIgnoreCase);

        public RosettaIdentityService(IClient client, IOptions<AuthSettings> authSettings,
            ApplicationDbContext context, INotificationService notificationService)
            : base(authSettings, context, notificationService)
        {
            _client = client;
            _context = context;
        }

        public override async Task<User> GetByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;

            var people = await _client.PeopleGETAsync(email: email, count: false, limit: 2,
                affiliationState: AffiliationState.All);
            return CreateUser(SelectPerson(people), email);
        }

        public override async Task<User> GetByKerberos(string kerb)
        {
            if (string.IsNullOrWhiteSpace(kerb)) return null;

            if (!_peopleByKerberos.TryGetValue(kerb, out var person))
            {
                person = SelectPerson(await _client.PeopleGETAsync(loginid: kerb, count: false, limit: 2,
                    affiliationState: AffiliationState.All));
            }

            return CreateUser(person);
        }

        public override async Task<PPSDepartmentResult> GetPpsDepartment(string ppsCode)
        {
            if (string.IsNullOrWhiteSpace(ppsCode)) return null;

            var departments = await _client.DepartmentsAllAsync(departmentid: ppsCode);
            var department = departments?.FirstOrDefault(d =>
                string.Equals(d.Department_id, ppsCode, StringComparison.OrdinalIgnoreCase));
            return department == null ? null : new PPSDepartmentResult
            {
                deptCode = department.Department_id,
                deptDisplayName = department.Department_title ?? department.Department_short_title
            };
        }

        public override async Task<string> GetTitle(string iamId)
        {
            try
            {
                var person = await GetPersonByIam(iamId);
                return person?.Employee_association?
                    .Where(a => !string.IsNullOrWhiteSpace(a.Position_title))
                    .OrderByDescending(a => a.Job_indicator == Employee_associationJob_indicator.P)
                    .FirstOrDefault()?.Position_title ?? string.Empty;
            }
            catch (Exception)
            {
                Log.Warning("Rosetta title lookup failed.");
                return string.Empty;
            }
        }

        public override async Task<string> GetIamSupervisor(string iamId)
        {
            try
            {
                var person = await GetPersonByIam(iamId);
                var primarySupervisor = person?.Employee_association?
                    .FirstOrDefault(a => a.Job_indicator == Employee_associationJob_indicator.P &&
                        !string.IsNullOrWhiteSpace(a.Reports_to_iam_id))?.Reports_to_iam_id;
                if (!string.IsNullOrWhiteSpace(primarySupervisor)) return primarySupervisor;
                if (!string.IsNullOrWhiteSpace(person?.Manager_iam_id)) return person.Manager_iam_id;
                return person?.Employee_association?
                    .FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.Reports_to_iam_id))?.Reports_to_iam_id
                    ?? string.Empty;
            }
            catch (Exception)
            {
                Log.Warning("Rosetta supervisor lookup failed.");
                return string.Empty;
            }
        }

        public override async Task<string> BulkLoadPeople(string ppsCode, string teamslug, string actorName, string actorId)
        {
            // An empty department filter would search the entire directory.
            if (string.IsNullOrWhiteSpace(ppsCode))
                throw new ArgumentException("A department code is required.", nameof(ppsCode));

            var team = await _context.Teams.SingleAsync(t => t.Slug == teamslug);
            var added = 0;
            var warnings = new StringBuilder();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            for (var offset = 0; ; offset += PageSize)
            {
                // Rosetta's POST endpoint only accepts identity lists. Department searches
                // require GET; each page already includes everything needed to create people.
                var page = await _client.PeopleGETAsync(department: ppsCode, count: false,
                    limit: PageSize, offset: offset, affiliationState: AffiliationState.WithAffiliation);
                if (page == null || page.Count == 0) break;

                foreach (var person in page)
                {
                    if (string.IsNullOrWhiteSpace(person?.Iam_id) || !seen.Add(person.Iam_id)) continue;
                    CachePerson(person);
                    var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Iam == person.Iam_id);
                    var kerb = existingUser?.Id ?? person.Id?.Login_id;
                    if (string.IsNullOrWhiteSpace(kerb))
                    {
                        warnings.Append($" IAM ID {person.Iam_id} failed to save.");
                        continue;
                    }

                    var result = await GetOrCreatePersonFromKerberos(kerb, team.Id, team, actorName, actorId,
                        $"Bulk Load from PPS code: {ppsCode}");
                    added += result.peopleCount;
                    if (result.Person == null) warnings.Append($" Kerb Id: {kerb} failed to save.");
                }

                if (page.Count < PageSize) break;
            }

            return $"{added} new people added to the team. {warnings}";
        }

        private async Task<RosettaPerson> GetPersonByIam(string iamId)
        {
            if (string.IsNullOrWhiteSpace(iamId)) return null;
            if (_peopleByIam.TryGetValue(iamId, out var person)) return person;

            return SelectPerson(await _client.PeopleGETAsync(iamid: iamId, count: false, limit: 2,
                affiliationState: AffiliationState.All));
        }

        private RosettaPerson SelectPerson(ICollection<RosettaPerson> people)
        {
            var matches = people?.Where(p => p != null).ToArray();
            if (matches == null || matches.Length == 0) return null;
            if (matches.Select(p => (p.Iam_id, p.Id?.Login_id)).Distinct().Count() > 1)
                throw new InvalidOperationException("Rosetta returned ambiguous identity records.");

            CachePerson(matches[0]);
            return matches[0];
        }

        private void CachePerson(RosettaPerson person)
        {
            if (!string.IsNullOrWhiteSpace(person.Iam_id)) _peopleByIam[person.Iam_id] = person;
            var kerb = person.Id?.Login_id;
            if (!string.IsNullOrWhiteSpace(kerb))
            {
                if (_peopleByKerberos.TryGetValue(kerb, out var cached) && cached.Iam_id != person.Iam_id)
                    throw new InvalidOperationException("Rosetta returned ambiguous identity records.");
                _peopleByKerberos[kerb] = person;
            }
        }

        private static User CreateUser(RosettaPerson person, string matchedEmail = null)
        {
            if (string.IsNullOrWhiteSpace(person?.Iam_id) || string.IsNullOrWhiteSpace(person.Id?.Login_id))
                return null;

            var user = new User
            {
                Id = person.Id.Login_id,
                Iam = person.Iam_id,
                FirstName = person.Name?.Lived_first_name,
                LastName = person.Name?.Lived_last_name,
                Pronouns = person.Name?.Lived_pronouns,
                Email = !string.IsNullOrWhiteSpace(person.Email?.Campus) ? person.Email.Campus : matchedEmail
            };
            return Validator.TryValidateObject(user, new ValidationContext(user), new List<ValidationResult>(),
                validateAllProperties: true) ? user : null;
        }
    }
}
