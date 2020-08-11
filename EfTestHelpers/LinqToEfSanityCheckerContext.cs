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
    public class LinqToEfSanityCheckerContext
    {
        public Solution Solution { get; private set; }
        public Project Project { get; private set; }
        public Compilation Compilation { get; private set; }
        public INamedTypeSymbol QueryableExtensionsSymbol { get; private set; }
        public Document Document { get; private set; }
        public SymbolCallerInfo CallerInfo { get; private set; }
        public InvocationExpressionSyntax InvocationSyntax { get; private set; }
        public IMethodSymbol MethodSymbol { get; private set; }
        public DataFlowAnalysis DataFlowAnalysis { get; private set; }
        public ImmutableList<string> ErrorMessages { get; private set; }

        private LinqToEfSanityCheckerContext Copy()
        {
            return new LinqToEfSanityCheckerContext
            {
                Solution = Solution,
                CallerInfo = CallerInfo,
                Compilation = Compilation,
                DataFlowAnalysis = DataFlowAnalysis,
                Document = Document,
                ErrorMessages = ErrorMessages,
                InvocationSyntax = InvocationSyntax,
                MethodSymbol = MethodSymbol,
                Project = Project,
                QueryableExtensionsSymbol = QueryableExtensionsSymbol
            };
        }

        public LinqToEfSanityCheckerContext SetSolution(Solution solution)
        {
            var copy = Copy();
            copy.Solution = solution;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetProject(Project project)
        {
            var copy = Copy();
            copy.Project = project;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetCompilation(Compilation compilation)
        {
            var copy = Copy();
            copy.Compilation = compilation;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetQueryableExtensionsSymbol(INamedTypeSymbol queryableExtensionsSymbol)
        {
            var copy = Copy();
            copy.QueryableExtensionsSymbol = queryableExtensionsSymbol;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetDocument(Document document)
        {
            var copy = Copy();
            copy.Document = document;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetCallerInfo(SymbolCallerInfo callerInfo)
        {
            var copy = Copy();
            copy.CallerInfo = callerInfo;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetInvocationSyntax(InvocationExpressionSyntax invocationSyntax)
        {
            var copy = Copy();
            copy.InvocationSyntax = invocationSyntax;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetMethodSymbol(IMethodSymbol methodSymbol)
        {
            var copy = Copy();
            copy.MethodSymbol = methodSymbol;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetDataFlowAnalysis(DataFlowAnalysis dataFlowAnalysis)
        {
            var copy = Copy();
            copy.DataFlowAnalysis = dataFlowAnalysis;
            return copy;
        }

        public LinqToEfSanityCheckerContext AddErrorMessage(string errorMessage)
        {
            var copy = Copy();
            copy.ErrorMessages = ErrorMessages.Add(errorMessage);
            return copy;
        }
    }
}
