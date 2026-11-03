using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models.ReportModels;
using Keas.Mvc.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Test.Integration
{
    public class IncompleteDocumentReportTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly ReportService _service;
        private readonly Team _team = new Team { Name = "First team", Slug = "first-team" };
        private readonly Team _memberTeam = new Team { Name = "Second team", Slug = "second-team" };
        private readonly Team _outsideTeam = new Team { Name = "Outside team", Slug = "outside-team" };
        private readonly Group _group = new Group { Name = "Reporting group" };

        public IncompleteDocumentReportTests()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();
            _context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection).Options);
            _context.Database.EnsureCreated();
            _context.Teams.AddRange(_team, _memberTeam, _outsideTeam);
            _context.GroupXTeams.AddRange(
                new GroupXTeam { Group = _group, Team = _team },
                new GroupXTeam { Group = _group, Team = _memberTeam });
            _context.SaveChanges();
            _service = new ReportService(_context, Mock.Of<ISecurityService>(MockBehavior.Strict));
        }

        [Theory]
        [InlineData("team")]
        [InlineData("slug")]
        [InlineData("group")]
        public async Task ReportsSeparateCountsRegardlessOfStatusCasing(string scope)
        {
            var mixed = AddPerson(_team, "Mixed");
            AddDocuments(mixed, "Declined", "DECLINED", "Sent", "sent", "sEnT", "vOiDeD", "Completed");
            AddDocument(mixed, "Declined", active: false);
            AddDocument(mixed, "Sent", active: false);
            AddDocument(mixed, "Voided", active: false);
            var voidedOnly = AddPerson(_team, "Voided");
            AddDocuments(voidedOnly, "Voided");
            var deliveredOnly = AddPerson(_team, "Delivered");
            AddDocuments(deliveredOnly, "Delivered");
            var unknownStatuses = AddPerson(_team, "UnknownStatuses");
            AddDocuments(unknownStatuses, "Delivered", "Created", "Unrecognized", null, "");
            AddDocument(unknownStatuses, "Created", active: false);
            var nullStatusOnly = AddPerson(_team, "NullStatus");
            AddDocument(nullStatusOnly, null);
            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();

            var rows = await Report(scope);

            Assert.Equal(5, rows.Count);
            var mixedRow = Assert.Single(rows.Where(row => row.PersonId == mixed.Id));
            AssertCounts(mixedRow, declined: 2, sent: 3, voided: 1);
            Assert.Equal(mixed.FirstName, mixedRow.FirstName);
            Assert.Equal(mixed.LastName, mixedRow.LastName);
            Assert.Equal(mixed.Email, mixedRow.Email);
            AssertCounts(Assert.Single(rows.Where(row => row.PersonId == voidedOnly.Id)), 0, 0, 1);
            AssertCounts(Assert.Single(rows.Where(row => row.PersonId == deliveredOnly.Id)), 0, 0, 0, unknown: 1);
            AssertCounts(Assert.Single(rows.Where(row => row.PersonId == unknownStatuses.Id)), 0, 0, 0, unknown: 5);
            AssertCounts(Assert.Single(rows.Where(row => row.PersonId == nullStatusOnly.Id)), 0, 0, 0, unknown: 1);
        }

        [Theory]
        [InlineData("team")]
        [InlineData("slug")]
        [InlineData("group")]
        public async Task ExcludesPeopleWithoutActiveIncompleteDocuments(string scope)
        {
            var included = AddPerson(_team, "Included");
            AddDocuments(included, "Sent");
            var completedOnly = AddPerson(_team, "Completed");
            AddDocuments(completedOnly, "Completed", "completed", "COMPLETED");
            AddPerson(_team, "NoDocuments");
            var inactiveDocumentsOnly = AddPerson(_team, "InactiveDocuments");
            AddDocument(inactiveDocumentsOnly, "Sent", active: false);
            AddDocument(inactiveDocumentsOnly, "Voided", active: false);
            var inactivePerson = AddPerson(_team, "InactivePerson");
            inactivePerson.Active = false;
            AddDocuments(inactivePerson, "Declined", "Sent", "Voided");
            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();

            var row = Assert.Single(await Report(scope));

            Assert.Equal(included.Id, row.PersonId);
            AssertCounts(row, 0, 1, 0);
        }

        [Theory]
        [InlineData("team")]
        [InlineData("slug")]
        [InlineData("group")]
        public async Task RestrictsResultsToRequestedTeamsAndKeepsGroupMetadata(string scope)
        {
            var first = AddPerson(_team, "First");
            AddDocuments(first, "Sent");
            var second = AddPerson(_memberTeam, "Second");
            AddDocuments(second, "Declined", "Voided");
            var outside = AddPerson(_outsideTeam, "Outside");
            AddDocuments(outside, "Sent", "Voided");
            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();

            var rows = await Report(scope);

            Assert.DoesNotContain(rows, row => row.PersonId == outside.Id);
            var firstRow = Assert.Single(rows.Where(row => row.PersonId == first.Id));
            AssertCounts(firstRow, 0, 1, 0);
            if (scope == "group")
            {
                Assert.Equal(2, rows.Count);
                var secondRow = Assert.Single(rows.Where(row => row.PersonId == second.Id));
                AssertCounts(secondRow, 1, 0, 1);
                Assert.Equal(_team.Name, firstRow.TeamName);
                Assert.Equal(_team.Slug, firstRow.TeamSlug);
                Assert.Equal(_memberTeam.Name, secondRow.TeamName);
                Assert.Equal(_memberTeam.Slug, secondRow.TeamSlug);
            }
            else
            {
                Assert.Single(rows);
            }
        }

        private Task<IList<IncompleteDocumentReportModel>> Report(string scope)
        {
            return scope == "group"
                ? _service.IncompleteDocuments(_group)
                : _service.IncompleteDocuments(scope == "team" ? _team : null, _team.Slug);
        }

        private Person AddPerson(Team team, string name)
        {
            var person = new Person
            {
                Team = team,
                FirstName = name,
                LastName = "Person",
                Email = $"{name.ToLowerInvariant()}@example.test"
            };
            _context.People.Add(person);
            return person;
        }

        private void AddDocuments(Person person, params string[] statuses)
        {
            foreach (var status in statuses)
            {
                AddDocument(person, status);
            }
        }

        private void AddDocument(Person person, string status, bool active = true)
        {
            _context.Documents.Add(new Document
            {
                Name = "Test document",
                Team = person.Team,
                Person = person,
                Status = status,
                Active = active,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        }

        private static void AssertCounts(IncompleteDocumentReportModel row, int declined, int sent, int voided, int unknown = 0)
        {
            Assert.Equal(declined, row.DeclinedDocumentCount);
            Assert.Equal(sent, row.SentDocumentCount);
            Assert.Equal(voided, row.VoidedDocumentCount);
            Assert.Equal(unknown, row.UnknownDocumentCount);
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
