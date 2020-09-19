using System;
using System.Collections.Generic;
using System.Collections.Immutable;
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

    public class QueryableScanner
    {
        private readonly string _solutionPath;

        private readonly QueryableScannerOptions _options;

        private readonly List<TextSpan> _topLevelSpans;


        public QueryableScanner(string solutionPath, QueryableScannerOptions options)
        {
            _solutionPath = solutionPath;
            _options = options;
            _topLevelSpans = new List<TextSpan>();
        }

        public async IAsyncEnumerable<QueryableExpressionContext> ScanForEfQueries()
        {
            await foreach (var context in GetLinqToEfCalls())
            {
                yield return context;
            }
        }

        private async IAsyncEnumerable<QueryableExpressionContext> GetLinqToEfCalls()
        {
            _topLevelSpans.Clear();

            var analyzerManager = new AnalyzerManager(_solutionPath, new AnalyzerManagerOptions
            {

                ProjectFilter = proj => _options.ProjectFilter(null, null, proj.ProjectName)
            });

            var workspace = analyzerManager.GetWorkspace();

            var context = new QueryableExpressionContext();

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

                if (efQueryableExtensionsSymbol == null)
                    continue; // No IQueryable extension methods referenced from this project

                // Find all extension methods that might be used against an Ef Queryable
                var extensionMethods = efQueryableExtensionsSymbol.GetMethods()
                    .Where(m => m.IsExtensionMethod && (m.Parameters.FirstOrDefault()?.Type.Name.Contains("Queryable") ?? false))
                    .GroupBy(s => s.Name)
                    .ToImmutableDictionary(g => g.Key, g => g.ToImmutableArray());

                context = context.SetExtensionMethods(extensionMethods);

                var callerInfos = extensionMethods
                    .SelectMany(g => g.Value)
                    .SelectMany(m => SymbolFinder.FindCallersAsync(m, context.Solution).GetAwaiter().GetResult())
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
                    context = context.SetMethodName(callerInfo.CallingSymbol.Name);

                    if (!_options.CallerInfoFilter(context, callerInfo))
                        continue;

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

                        if (!SymbolEqualityComparer.Default.Equals(methodSymbol?.ContainingSymbol, efQueryableExtensionsSymbol))
                            continue;

                        context = context.SetExtensionMethod(methodSymbol.ReducedFrom ?? methodSymbol);
                        context = context.SetInvocationSetDataFlowAnalysis(model.AnalyzeDataFlow(context.ExtensionMethodInvocation));
                        context = context.SetLineNumber(invocationSyntax.GetLineNumber());

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
