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
        public Func<LinqToEfSanityCheckerContext, Solution, bool> SolutionFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, Project, string, bool> ProjectFilter { get; internal set; } = (_1, _2, _3) => true;
        public Func<LinqToEfSanityCheckerContext, Document, bool> DocumentFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, SymbolCallerInfo, bool> CallerInfoFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, InvocationExpressionSyntax, bool> InvocationSyntaxFilter { get; internal set; } = (_1, _2) => true;
        public Func<LinqToEfSanityCheckerContext, IMethodSymbol, bool> MethodSymbolFilter { get; internal set; } = (_1, _2_) => true;

    }

    public static class LinqToEfSanityCheckerOptionsExtensions
    {
        public static LinqToEfSanityCheckerOptions ExcludeProjectsByName(this LinqToEfSanityCheckerOptions o,
            string projectName1, params string[] projectNames)
        {
            var excludeSet = new HashSet<string>(projectNames) {projectName1};

            o.ProjectFilter = (_1, _2, p) => !excludeSet.Contains(p);

            return o;
        }

        public static LinqToEfSanityCheckerOptions IncludeAllEntityFrameworkQueryableExtensions(this LinqToEfSanityCheckerOptions o)
        {
            var excludeMethodNames = new HashSet<string>
                {"AsNoTracking", "AsTracking", "IgnoreQueryFilters", "Include", "TagWith", "ThenInclude"};

            var includeMethodNames = new HashSet<string>(typeof(EntityFrameworkQueryableExtensions).GetMethods()
                .Where(m => !excludeMethodNames.Contains(m.Name))
                .Select(m => m.Name));

            o.CallerInfoFilter = (context, callerInfo) =>
                //only consider callingSymbols declared in the current compilation
                SymbolEqualityComparer.Default.Equals(context.Compilation.Assembly, callerInfo.CallingSymbol?.ContainingAssembly)
                    && !excludeMethodNames.Contains(callerInfo.CalledSymbol.Name);

            o.InvocationSyntaxFilter = (context, invocationSyntax) => invocationSyntax.Expression is MemberAccessExpressionSyntax m
                                                                      && includeMethodNames.Contains(m.Name.ToString());

            return o;
        }
    }
    
}
