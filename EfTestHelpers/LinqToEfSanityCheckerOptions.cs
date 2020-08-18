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
    public class LinqToEfSanityCheckerOptions
    {
        public Func<LinqToEfSanityCheckerContext, Project, string, bool> ProjectFilter { get; internal set; } = (_1, _2, _3) => true;
        public Func<LinqToEfSanityCheckerContext, Document, bool> DocumentFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, SymbolCallerInfo, bool> CallerInfoFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, InvocationExpressionSyntax, bool> InvocationSyntaxFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, IMethodSymbol, bool> MethodSymbolFilter { get; internal set; } = (_1, _2_) => true;
        public Action<string> OutputWriteLine { get; internal set; } = Console.WriteLine;

        public static LinqToEfSanityCheckerOptions CreateDefault(params string[] excludeProjectNames)
        {
            var options = new LinqToEfSanityCheckerOptions()
                .IncludeAllEfAndLinqQueryableExtensions();
            
            if (excludeProjectNames.Length > 0)
                options.ExcludeProjectsByName(excludeProjectNames[0], excludeProjectNames.Skip(1).ToArray());

            return options;
        }
    }

    public static class LinqToEfSanityCheckerOptionsExtensions
    {
        public static LinqToEfSanityCheckerOptions AddOutputWriter(this LinqToEfSanityCheckerOptions options,
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

        public static LinqToEfSanityCheckerOptions ReplaceOutputWriter(this LinqToEfSanityCheckerOptions options,
            Action<string> outputWriter)
        {
            if (outputWriter == null)
                throw new ArgumentNullException(nameof(outputWriter));

            options.OutputWriteLine = message => outputWriter.Invoke(message);

            return options;
        }

        public static LinqToEfSanityCheckerOptions ExcludeProjectsByName(this LinqToEfSanityCheckerOptions o,
            string projectName1, params string[] projectNames)
        {
            var excludeSet = new HashSet<string>(projectNames) {projectName1};

            o.ProjectFilter = (_1, _2, p) => !excludeSet.Contains(p);

            return o;
        }

        public static LinqToEfSanityCheckerOptions IncludeAllEfAndLinqQueryableExtensions(this LinqToEfSanityCheckerOptions o)
        {
            var excludeMethodNames = new HashSet<string>
                {"AsNoTracking", "AsTracking", "IgnoreQueryFilters", "Include", "TagWith", "ThenInclude"};

            var includeMethodNames = new HashSet<string>(typeof(EntityFrameworkQueryableExtensions).GetMethods()
                .Union(typeof(Queryable).GetMethods())
                .Where(m => !excludeMethodNames.Contains(m.Name))
                .Select(m => m.Name));

            o.CallerInfoFilter = (context, callerInfo) =>
                //only consider callingSymbols declared in the given compilation
                SymbolEqualityComparer.Default.Equals(context.Compilation.Assembly, callerInfo.CallingSymbol?.ContainingAssembly)
                    && !excludeMethodNames.Contains(callerInfo.CalledSymbol.Name);

            o.InvocationSyntaxFilter = (context, invocationSyntax) => invocationSyntax.Expression is MemberAccessExpressionSyntax m
                                                                      && includeMethodNames.Contains(m.Name.ToString());

            return o;
        }
    }
    
}
