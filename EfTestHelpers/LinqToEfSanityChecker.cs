using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Buildalyzer;
using Buildalyzer.Workspaces;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.CodeAnalysis.Text;
using Microsoft.EntityFrameworkCore;

namespace EfTestHelpers
{

    public class LinqToEfSanityChecker
    {
        private readonly string _solutionPath;

        private readonly LinqToEfSanityCheckerOptions _options;

        private readonly List<TextSpan> _topLevelSpans;


        public LinqToEfSanityChecker(string solutionPath, LinqToEfSanityCheckerOptions options)
        {
            _solutionPath = solutionPath;
            _options = options;
            _topLevelSpans = new List<TextSpan>();
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
            _topLevelSpans.Clear();

            var analyzerManager = new AnalyzerManager(_solutionPath, new AnalyzerManagerOptions
            {

                ProjectFilter = proj => _options.ProjectFilter(null, null, proj.ProjectName)
            });

            var workspace = analyzerManager.GetWorkspace();

            var context = new LinqToEfSanityCheckerContext();

            context = context.SetSolution(workspace.CurrentSolution);

            var relativePathBase = Path.Combine(_solutionPath, "..");

            var uniqueInvocationExpressions = new HashSet<string>();

            foreach (var p in context.Solution.Projects
                .Where(p => _options.ProjectFilter(context, p, p.Name))
                .OrderBy(p => p.Name))
            {
                context = context.SetProject(p);
                context = context.SetCompilation(await context.Project.GetCompilationAsync());

                var efQueryableExtensionsSymbol = context.Compilation.GetTypeByMetadataName(
                        "Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions");
                var linqQueryableExtensionsSymbol = context.Compilation.GetTypeByMetadataName(
                    "System.Linq.Queryable");

                if (efQueryableExtensionsSymbol == null && linqQueryableExtensionsSymbol == null)
                    continue; // No IQueryable extension methods referenced from this project

                // Find all extension methods that might be used against an Ef Queryable
                var methodSymbols = efQueryableExtensionsSymbol.GetMethods()
                    .Union(efQueryableExtensionsSymbol.GetMethods())
                    .Where(m => m.IsExtensionMethod && (m.Parameters.FirstOrDefault()?.Type.Name.Contains("Queryable") ?? false))
                    .ToArray();

                var callerInfos = methodSymbols
                    .SelectMany(m => SymbolFinder.FindCallersAsync(m, context.Solution).GetAwaiter().GetResult())
                    .Where(s => _options.CallerInfoFilter(context, s))
                    // make ordering consistent from one run to the next
                    .OrderBy(c => context.Project.GetDocument(c.CallingSymbol.DeclaringSyntaxReferences[0].GetSyntax().SyntaxTree).FilePath)
                    .ThenBy(c => c.CallingSymbol.DeclaringSyntaxReferences[0].Span.Start)
                    .ToArray();

                foreach (var callerInfo in callerInfos)
                {
                    context = context.SetCallerInfo(callerInfo);

                    var callerSyntax = context.CallerInfo.CallingSymbol.DeclaringSyntaxReferences.First().GetSyntax();

                    var document = context.Project.GetDocument(callerSyntax.SyntaxTree);

                    if (document == null || !_options.DocumentFilter(context, document))
                        continue;

                    context = context.SetDocument(document);
                    context = context.SetFilePath(Path.GetRelativePath(relativePathBase, document.FilePath));
                    context = context.SetLineNumber(callerSyntax.GetLineNumber());
                    context = context.SetMethodName(callerInfo.CallingSymbol.Name);

                    var model = await document.GetSemanticModelAsync();

                    var context1 = context; // to avoid access to modified closure
                    var invocationSyntaxes = callerSyntax.DescendantNodes()
                        .OfType<InvocationExpressionSyntax>()
                        .Where(i => _options.InvocationSyntaxFilter(context1, i));

                    foreach (var invocationSyntax in invocationSyntaxes.OrderBy(s => s.Span.Start))
                    {
                        // We don't want to return a different context for any nested expressions since they are
                        // already encapsulated in the top-level expressions for a given Caller
                        if (_topLevelSpans.Any(s => s.Contains(invocationSyntax.Span)))
                            continue;

                        context = context.SetExtensionMethodInvocation(invocationSyntax);

                        // make sure the methodSymbol actually is an Ef or Linq Queryable extension method
                        var methodSymbol = model.GetSymbolInfo(context.ExtensionMethodInvocation).Symbol as IMethodSymbol;

                        if (SymbolEqualityComparer.Default.Equals(methodSymbol?.ContainingSymbol, efQueryableExtensionsSymbol))
                            context = context.SetExtensionMethodOwner(QueryableExtensionsOwner.Ef);
                        else if (SymbolEqualityComparer.Default.Equals(methodSymbol?.ContainingSymbol,
                            linqQueryableExtensionsSymbol))
                            context = context.SetExtensionMethodOwner(QueryableExtensionsOwner.Linq);
                        else
                            continue;

                        if (!_options.MethodSymbolFilter(context, methodSymbol))
                            continue;

                        context = context.SetExtensionMethod(methodSymbol);
                        context = context.SetInvocationSetDataFlowAnalysis(model.AnalyzeDataFlow(context.ExtensionMethodInvocation));

                        _topLevelSpans.Add(context.ExtensionMethodInvocation.Span);

                        if (!context.InvocationDataFlowAnalysis.Succeeded)
                        {
                            yield return context.AddErrorMessage("DataFlowAnalysis did not succeed.");
                            continue;
                        }

                        if (uniqueInvocationExpressions.Add(context.ExtensionMethodInvocation.ToString()))
                            yield return context;
                    }
                }
            }
        }

    }
}
