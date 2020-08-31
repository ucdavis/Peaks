using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Buildalyzer;
using Buildalyzer.Workspaces;
using EfTestHelpers;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Build.Utilities;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.CodeAnalysis.MSBuild;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.Extensions.DependencyModel;
using Shouldly;
using Test.Helpers;
using Xunit;
using Xunit.Abstractions;
using Task = System.Threading.Tasks.Task;


namespace Test.Integration
{
    [Collection("Init collection")]
    public class LinqToEfTests : IClassFixture<WebApplicationFactory<Startup>>
    {
        private readonly WebApplicationFactory<Startup> _factory;
        private readonly ITestOutputHelper _output;

        public LinqToEfTests(WebApplicationFactory<Startup> factory, ITestOutputHelper output)
        {
            _factory = factory;
            _output = output;
        }

        [Fact]
        public async Task AllLinqToEfQueriesShouldBeTranslatable()
        {
            // Arrange
            var itemNum = 0;
            var slnPath =
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), $"..", "..", "..", "..", "Keas.sln"));

            

            var options = QueryableScannerOptions
                .CreateDefault("Test", "Keas.Sql", "Keas.Jobs.Core", "Keas.Jobs.SendMail", "EfTestHelpers")
                .AddOutputWriter(message => _output.WriteLine(message));

            var queryableScanner = new QueryableScanner(slnPath, options);

            var queryableExpressionContexts = await queryableScanner.ScanForEfQueries().ToListAsync();

            _factory.GetKeasClient(db =>
            {
                var dbService = new TestDbService(db);

                var builder = new QueryableBuilder<ApplicationDbContext>(options);

                var i = 0;

                foreach (var c in queryableExpressionContexts)
                {
                    _output.WriteLine($"{Environment.NewLine}{++i:D4} ************ {c}");

                    var queryable = Should.NotThrow(() => builder.GetQueryable(db, c), "Failed to build queryable");

                    var sql = Should.NotThrow(() => queryable.ToSql(), "Failed to generate sql");
                }
            });
        }


        [Fact]
        public async Task TestDbServiceQueriesShouldBeTranslatable()
        {
            var slnPath =
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), $"..", "..", "..", "..", "Keas.sln"));

            var options = QueryableScannerOptions
                .CreateDefault("Keas.Sql", "Keas.Jobs.Core", "Keas.Jobs.SendMail", "Keas.Core", "Keas.Mvc", "EfTestHelpers")
                .AddOutputWriter(message => _output.WriteLine(message))
                .LimitToExpressionsInTypes(typeof(TestDbService));

            var queryableScanner = new QueryableScanner(slnPath, options);

            var queryableExpressionContexts = await queryableScanner.ScanForEfQueries().ToListAsync();

            _factory.GetKeasClient(db =>
            {
                var dbService = new TestDbService(db);

                var builder = new QueryableBuilder<ApplicationDbContext>(options);

                var i = 0;

                foreach (var c in queryableExpressionContexts)
                {
                    _output.WriteLine($"{Environment.NewLine}{++i:D4} ************ {c}");

                    var queryable = Should.NotThrow(() => builder.GetQueryable(db, c), "Failed to build queryable");

                    var sql = Should.NotThrow(() => queryable.ToSql(), "Failed to generate sql");
                }
            });
        }
    }

    public class TestDbService
    {
        private readonly ApplicationDbContext _dbContext;
        private static readonly string _string01 = "NotEmpty";
        private static readonly int _int01 = 1;

        private IQueryable<Workstation> _expField000;

        public TestDbService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;

            _expField000 = dbContext.Workstations.AsQueryable()
                .Where(w => w.Assignment.PersonId == _int01 && w.Team.Slug == _string01);
        }

        public void TestExpression01()
        {
            // this query...
            var exp000 = _dbContext.Workstations.AsQueryable()
                .Where(w => w.Assignment.PersonId == _int01 && w.Team.Slug == _string01)
                .ToArrayAsync();

            // ...is compiled to something pretty closely resempling this...
            IQueryable<Workstation> source = _dbContext.Workstations.AsQueryable();
            var parameterExpression = Expression.Parameter(typeof(Workstation), "w");
            IQueryable<Workstation> expQueryable0 = source.Where(Expression.Lambda<Func<Workstation, bool>>(
                Expression.AndAlso(
                    Expression.Equal(
                        Expression.Property(
                            Expression.Property(parameterExpression,
                                LinqOp.PropertyOf(() => default(Workstation).Assignment)),
                            LinqOp.PropertyOf(() => default(AssignmentBase).PersonId)),
                        Expression.Field(null, LinqOp.FieldOf(() => TestDbService._int01))),
                    Expression.Equal(
                        Expression.Property(
                            Expression.Property(parameterExpression, LinqOp.PropertyOf(() => default(AssetBase).Team)),
                            LinqOp.PropertyOf(() => default(Team).Slug)),
                        Expression.Field(null, LinqOp.FieldOf(() => TestDbService._string01)))),
                new[]
                {
                    parameterExpression
                }));//.ToArrayAsync(default(CancellationToken));
        }
    }


    /// <summary>
    /// Provides one-time initialization actions
    /// </summary>
    /// <remarks>
    /// <see cref="ICollectionFixture&lt;SingleInitSqliteFixture&gt;"/> is just a marker interface to make
    /// Xunit recognize this as a CollectionDefinition
    /// </remarks>
    [CollectionDefinition("Init collection")]
    public class SingleInitSqliteFixture : ICollectionFixture<SingleInitSqliteFixture>
    {
        public SingleInitSqliteFixture()
        {
            // ensures platform-specific e_sqlite3 dependency is available
            SQLitePCL.Batteries_V2.Init();
        }
    }
}
