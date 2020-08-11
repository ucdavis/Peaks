using System;
using System.Collections.Generic;
using System.Linq;
using Buildalyzer;
using Buildalyzer.Workspaces;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.EntityFrameworkCore;

namespace EfTestHelpers
{
    public class LinqToEfSanityCheckerOptions
    {


    }

    public class LinqToEfSanityChecker
    {
        private readonly string _solutionPath;

        private readonly LinqToEfSanityCheckerOptions _options;

        public LinqToEfSanityChecker(string solutionPath, LinqToEfSanityCheckerOptions options = default)
        {
            _solutionPath = solutionPath;

            _options = options ?? new LinqToEfSanityCheckerOptions
            {

            };
        }

        private void SetDefaultOptions()
        {
            //if (_options.CanIncludeProject == null)
            //    _options.CanIncludeProject =
        }

        private async IAsyncEnumerable<LinqToEfAnalysisContext> GetLinqToEfCalls()
        {
            var analyzerManager = new AnalyzerManager(_solutionPath, new AnalyzerManagerOptions
            {
                ProjectFilter = proj => proj.ProjectName != "Test" && proj.ProjectName != "Keas.Sql"
            });

            var workspace = analyzerManager.GetWorkspace();

            var solution = workspace.CurrentSolution;

            var excludeMethodNames = new HashSet<string>
                {"AsNoTracking", "AsTracking", "IgnoreQueryFilters", "Include", "TagWith", "ThenInclude"};

            var includeMethodNames = new HashSet<string>(typeof(EntityFrameworkQueryableExtensions).GetMethods()
                .Where(m => !excludeMethodNames.Contains(m.Name))
                .Select(m => m.Name));

            var uniqueInvocationExpressions = new HashSet<string>();

            foreach (var project in solution.Projects)
            {
                var context = new LinqToEfAnalysisContext { Solution = solution, Project = project };

                var compilation = await project.GetCompilationAsync();

                var queryableExtensionsSymbol =
                    compilation.GetTypeByMetadataName(
                        "Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions");

                if (queryableExtensionsSymbol == null)
                    continue; // EntityFrameworkQueryableExtensions not referenced

                var methodSymbols = queryableExtensionsSymbol.GetMethods()
                    .Where(m => m.IsExtensionMethod && m.Parameters.FirstOrDefault()?.Type.Name == "IQueryable")
                    .ToArray();

                var callerInfos = methodSymbols
                    .SelectMany(m => SymbolFinder.FindCallersAsync(m, solution).GetAwaiter().GetResult())
                    .Where(s =>
                        //only consider callingSymbols declared in the current compilation
                        SymbolEqualityComparer.Default.Equals(compilation.Assembly, s.CallingSymbol?.ContainingAssembly)
                        && !excludeMethodNames.Contains(s.CalledSymbol.Name))
                    .ToArray();

                foreach (var callerInfo in callerInfos)
                {
                    var callerSyntax = callerInfo.CallingSymbol.DeclaringSyntaxReferences.First().GetSyntax();
                    var document = project.GetDocument(callerSyntax.SyntaxTree);
                    var model = compilation.GetSemanticModel(await document.GetSyntaxTreeAsync());
                    var callStatements = callerSyntax.DescendantNodes().OfType<InvocationExpressionSyntax>()
                        .Where(c => c.Expression is MemberAccessExpressionSyntax m
                                    && includeMethodNames.Contains(m.Name.ToString()));

                    foreach (var invocationExpressionSyntax in callStatements)
                    {
                        // make sure the methodSymbol actually is from EntityFrameworkQueryableExtensions 
                        var efMethodSymbol = model.GetSymbolInfo(invocationExpressionSyntax).Symbol as IMethodSymbol;
                        if (!SymbolEqualityComparer.Default.Equals(efMethodSymbol?.ContainingSymbol, queryableExtensionsSymbol))
                            continue;

                        var invocationAnalysis = model.AnalyzeDataFlow(invocationExpressionSyntax);

                        if (uniqueInvocationExpressions.Add(invocationExpressionSyntax.ToString()))
                            //yield return (solution, project, document, callerInfo, invocationExpressionSyntax, efMethodSymbol, invocationAnalysis);
                            yield return context;
                    }
                }
            }

            // look into https://github.com/Testura/Testura.Code


        }

        public class LinqToEfAnalysisContext
        {
            public Solution Solution { get; internal set; }
            public Project Project { get; internal set; }
            public Document Document { get; internal set; }
            public SymbolCallerInfo CallerInfo { get; internal set; }
            public InvocationExpressionSyntax InvocationSyntax { get; internal set; }
            public IMethodSymbol Method { get; internal set; }
            public DataFlowAnalysis Analysis { get; internal set; }
        }

    }

}
