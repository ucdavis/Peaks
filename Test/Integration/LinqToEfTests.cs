using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Threading.Tasks;
using Buildalyzer;
using Buildalyzer.Workspaces;
using EfTestHelpers;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Build.Utilities;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.CodeAnalysis.MSBuild;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.Extensions.DependencyModel;
using Test.Helpers;
using Xunit;
using Xunit.Abstractions;
using Task = System.Threading.Tasks.Task;


namespace Test.Integration
{
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

            

            var options = LinqToEfSanityCheckerOptions
                .CreateDefault("Test", "Keas.Sql", "Keas.Jobs.Core", "Keas.Jobs.SendMail")
                .AddOutputWriter(message => _output.WriteLine(message));

            var sanityChecker = new LinqToEfSanityChecker(slnPath, options);

            var contexts = await sanityChecker.CheckEfQueries().ToListAsync();

            var builder = new EfQueryableBuilder2(options);

            var i = 0;

            foreach (var c in contexts)
            {
                _output.WriteLine($"{Environment.NewLine}{++i:D4} ************ {c}");
                try
                {
                    builder.GetQueryable(null, c);
                }
                catch (ArgumentException e) when (e.Message.Contains("'''Syntax node is not within syntax tree"))
                {
                    _output.WriteLine(e.Message);

                }
            }

            //var client = _factory.GetKeasClient(db =>
            //{
            //    var query = db.KeySerials
            //        .Where(x => string.Equals(x.Key.Team.Slug, "test", StringComparison.OrdinalIgnoreCase));

            //    var sql = query.ToSql();
            //});
            // Act

            // Assert	
            //}
        }





    }

}
