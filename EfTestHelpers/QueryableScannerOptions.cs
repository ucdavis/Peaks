using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.EntityFrameworkCore;

namespace EfTestHelpers
{
    public class QueryableScannerOptions
    {
        public Func<QueryableExpressionContext, Project, string, bool> ProjectFilter { get; internal set; } = (_1, _2, _3) => true;
        public Func<QueryableExpressionContext, Document, bool> DocumentFilter { get; internal set; } = (_1, _2) => true;
        public Func<QueryableExpressionContext, SymbolCallerInfo, bool> CallerInfoFilter { get; internal set; } = (_1, _2) => true;
        public Func<QueryableExpressionContext, InvocationExpressionSyntax, bool> InvocationSyntaxFilter { get; internal set; } = (_1, _2) => true;
        public Func<QueryableExpressionContext, IMethodSymbol, bool> MethodSymbolFilter { get; internal set; } = (_1, _2_) => true;
        public Action<string> OutputWriteLine { get; internal set; } = Console.WriteLine;

        public static QueryableScannerOptions CreateDefault(params string[] excludeProjectNames)
        {
            var options = new QueryableScannerOptions()
                .IncludeAllEfAndLinqQueryableExtensions();
            
            if (excludeProjectNames.Length > 0)
                options.ExcludeProjectsByName(excludeProjectNames[0], excludeProjectNames.Skip(1).ToArray());

            return options;
        }
    }

    public static class QueryableCheckerOptionsExtensions
    {
        public static QueryableScannerOptions LimitToExpressionsInTypes(this QueryableScannerOptions o,
            params Type[] types)
        {
            var includeSet = new HashSet<Type>(types);

            var existingCallerInfoFilter = o.CallerInfoFilter;
            o.CallerInfoFilter = (context, callerInfo) =>
            {
                if (!existingCallerInfoFilter?.Invoke(context, callerInfo) ?? true)
                    return false;

                //only consider callingSymbols declared in the given compilation
                var containingType = callerInfo.CallingSymbol.ContainingType.GetClrType(context.Document.GetSemanticModelAsync().GetAwaiter()
                    .GetResult());

                return includeSet.Contains(containingType);
            };
            return o;
        }

        public static QueryableScannerOptions AddOutputWriter(this QueryableScannerOptions options,
            Action<string> outputWriter)
        {
            if (outputWriter == null)
                throw new ArgumentNullException(nameof(outputWriter));

            var currentWriter = options.OutputWriteLine;

            options.OutputWriteLine = message =>
            {
                currentWriter?.Invoke(message);
                outputWriter.Invoke(message);
            };

            return options;
        }

        public static QueryableScannerOptions ReplaceOutputWriter(this QueryableScannerOptions options,
            Action<string> outputWriter)
        {
            if (outputWriter == null)
                throw new ArgumentNullException(nameof(outputWriter));

            options.OutputWriteLine = message => outputWriter.Invoke(message);

            return options;
        }

        public static QueryableScannerOptions ExcludeProjectsByName(this QueryableScannerOptions o,
            string projectName1, params string[] projectNames)
        {
            var excludeSet = new HashSet<string>(projectNames) {projectName1};

            o.ProjectFilter = (_1, _2, p) => !excludeSet.Contains(p);

            return o;
        }

        public static QueryableScannerOptions IncludeAllEfAndLinqQueryableExtensions(this QueryableScannerOptions o)
        {
            var excludeMethodNames = new HashSet<string>
                {"AsNoTracking", "AsTracking", "IgnoreQueryFilters", "Include", "TagWith", "ThenInclude"};

            var includeMethodNames = new HashSet<string>(typeof(EntityFrameworkQueryableExtensions).GetMethods()
                .Union(typeof(Queryable).GetMethods())
                .Where(m => !excludeMethodNames.Contains(m.Name))
                .Select(m => m.Name));

            var existingCallerInfoFilter = o.CallerInfoFilter;
            o.CallerInfoFilter = (context, callerInfo) =>
            {
                if (!existingCallerInfoFilter?.Invoke(context, callerInfo) ?? true)
                    return false;

                //only consider callingSymbols declared in the given compilation
                return SymbolEqualityComparer.Default.Equals(context.Compilation.Assembly,
                           callerInfo.CallingSymbol?.ContainingAssembly)
                       && !excludeMethodNames.Contains(callerInfo.CalledSymbol.Name);
            };

            o.InvocationSyntaxFilter = (context, invocationSyntax) => invocationSyntax.Expression is MemberAccessExpressionSyntax m
                                                                      && includeMethodNames.Contains(m.Name.ToString());

            return o;
        }
    }
    
}
