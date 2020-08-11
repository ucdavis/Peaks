using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Buildalyzer;
using Buildalyzer.Workspaces;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.EntityFrameworkCore;

namespace EfTestHelpers
{

    public class LinqToEfSanityChecker
    {
        private readonly string _solutionPath;

        private readonly LinqToEfSanityCheckerOptions _options;

        public LinqToEfSanityChecker(string solutionPath, LinqToEfSanityCheckerOptions options)
        {
            _solutionPath = solutionPath;
            _options = options;
        }

        public async IAsyncEnumerable<LinqToEfSanityCheckerContext> CheckEfQueries()
        {
            await foreach (var context in GetLinqToEfCalls())
            {
                yield return context;
            }
        }

        private async IAsyncEnumerable<LinqToEfSanityCheckerContext> GetLinqToEfCalls()
        {
            var analyzerManager = new AnalyzerManager(_solutionPath, new AnalyzerManagerOptions
            {

                ProjectFilter = proj => _options.ProjectFilter(null, null, proj.ProjectName)
            });

            var workspace = analyzerManager.GetWorkspace();

            var context = new LinqToEfSanityCheckerContext();

            if (!_options.SolutionFilter(context, workspace.CurrentSolution))
                yield break;

            context = context.SetSolution(workspace.CurrentSolution);

            var uniqueInvocationExpressions = new HashSet<string>();

            foreach (var p in context.Solution.Projects
                .Where(p => _options.ProjectFilter(context, p, p.Name)))
            {
                context = context.SetProject(p);

                context = context.SetCompilation(await context.Project.GetCompilationAsync());

                context = context.SetQueryableExtensionsSymbol(context.Compilation.GetTypeByMetadataName(
                        "Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions"));

                if (context.QueryableExtensionsSymbol == null)
                    continue; // EntityFrameworkQueryableExtensions not referenced from this project

                var methodSymbols = context.QueryableExtensionsSymbol.GetMethods()
                    .Where(m => m.IsExtensionMethod && m.Parameters.FirstOrDefault()?.Type.Name == "IQueryable")
                    .ToArray();

                var callerInfos = methodSymbols
                    .SelectMany(m => SymbolFinder.FindCallersAsync(m, context.Solution).GetAwaiter().GetResult())
                    .Where(s => _options.CallerInfoFilter(context, s))
                    .ToArray();

                foreach (var callerInfo in callerInfos)
                {
                    context = context.SetCallerInfo(callerInfo);

                    var callerSyntax = context.CallerInfo.CallingSymbol.DeclaringSyntaxReferences.First().GetSyntax();

                    var document = context.Project.GetDocument(callerSyntax.SyntaxTree);

                    if (!_options.DocumentFilter(context, document))
                        continue;

                    context = context.SetDocument(document);

                    var model = context.Compilation.GetSemanticModel(await context.Document.GetSyntaxTreeAsync());

                    var context1 = context; // to avoid access to modified closure
                    var invocationSyntaxes = callerSyntax.DescendantNodes()
                        .OfType<InvocationExpressionSyntax>()
                        .Where(i => _options.InvocationSyntaxFilter(context1, i));

                    foreach (var invocationSyntax in invocationSyntaxes)
                    {
                        context = context.SetInvocationSyntax(invocationSyntax);

                        // make sure the methodSymbol actually is from EntityFrameworkQueryableExtensions 
                        var efMethodSymbol = model.GetSymbolInfo(context.InvocationSyntax).Symbol as IMethodSymbol;
                        if (!SymbolEqualityComparer.Default.Equals(efMethodSymbol?.ContainingSymbol, context.QueryableExtensionsSymbol))
                            continue;

                        if (!_options.MethodSymbolFilter(context, efMethodSymbol))
                            continue;

                        context = context.SetDataFlowAnalysis(model.AnalyzeDataFlow(context.InvocationSyntax));
                        if (!context.DataFlowAnalysis.Succeeded)
                        {
                            yield return context.AddErrorMessage("DataFlowAnalysis did not succeed.");
                            continue;
                        }

                        if (uniqueInvocationExpressions.Add(context.InvocationSyntax.ToString()))
                            yield return context;
                    }
                }
            }

            // look into https://github.com/Testura/Testura.Code


        }

    }
}
