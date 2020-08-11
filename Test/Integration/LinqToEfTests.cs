using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
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

            var relativePathBase = Path.Combine(slnPath, "..");

            var options = new LinqToEfSanityCheckerOptions()
                .ExcludeProjectsByName("Test", "Keas.Sql", "Keas.Jobs.Core")
                .IncludeAllEntityFrameworkQueryableExtensions();

            var sanityChecker = new LinqToEfSanityChecker(slnPath, options);


            var contexts = await sanityChecker.CheckEfQueries().ToListAsync();

            foreach (var c in contexts)
            {
                var path = Path.GetRelativePath(relativePathBase, c.Document.FilePath);
                var lineNumber = c.InvocationSyntax.SyntaxTree.GetLineSpan(c.InvocationSyntax.Span).StartLinePosition.Line;
                var callingMethod = c.CallerInfo.CallingSymbol.Name;

                _output.WriteLine($"Expression {++itemNum}, Line {lineNumber} of {path}, method {callingMethod} {Environment.NewLine}{c.InvocationSyntax}{Environment.NewLine}");
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
