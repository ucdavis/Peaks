using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.EntityFrameworkCore;

namespace EfTestHelpers
{
    public enum QueryableExtensionsOwner
    {
        None = 0,
        EfQueryableExtensions = 1,
        LinqEnumerableExtensions = 2
    }

    /// <summary>
    /// Provides details about the state of solution analysis
    /// </summary>
    /// <remarks>
    /// Implements an immutable pattern to ensure state at time of creation is accurately represented
    /// </remarks>
    [DebuggerDisplay("{FilePath}, {MethodName,nq}, Line {LineNumber}, {ExtensionMethodOwner}.{ExtensionMethod}")]
    public class QueryableExpressionContext
    {
        public Solution Solution { get; private set; }
        public Project Project { get; private set; }
        public Compilation Compilation { get; private set; }
        public ImmutableDictionary<string, ImmutableArray<IMethodSymbol>> ExtensionMethods { get; private set; }
        public Document Document { get; private set; }
        public SymbolCallerInfo CallerInfo { get; private set; }
        public InvocationExpressionSyntax ExtensionMethodInvocation { get; private set; }
        public IMethodSymbol ExtensionMethod { get; private set; }
        public DataFlowAnalysis InvocationDataFlowAnalysis { get; private set; }
        public ImmutableList<string> ErrorMessages { get; private set; } = ImmutableList<string>.Empty;
        public string FilePath { get; private set; }
        public int LineNumber { get; private set; }
        public string MethodName { get; private set; }
        public IQueryable GeneratedQueryable { get; set; }

        internal QueryableExpressionContext()
        {
        }

        private QueryableExpressionContext Copy()
        {
            return new QueryableExpressionContext
            {
                Solution = Solution,
                Project = Project,
                Compilation = Compilation,
                ExtensionMethods = ExtensionMethods,
                Document = Document,
                CallerInfo = CallerInfo,
                ExtensionMethodInvocation = ExtensionMethodInvocation,
                ExtensionMethod = ExtensionMethod,
                InvocationDataFlowAnalysis = InvocationDataFlowAnalysis,
                ErrorMessages = ErrorMessages,
                FilePath = FilePath,
                LineNumber = LineNumber,
                MethodName = MethodName
            };
        }

        public QueryableExpressionContext SetSolution(Solution solution)
        {
            var copy = Copy();
            copy.Solution = solution;
            return copy;
        }

        public QueryableExpressionContext SetProject(Project project)
        {
            var copy = Copy();
            copy.Project = project;
            return copy;
        }

        public QueryableExpressionContext SetCompilation(Compilation compilation)
        {
            var copy = Copy();
            copy.Compilation = compilation;
            return copy;
        }

        public QueryableExpressionContext SetExtensionMethods(
            ImmutableDictionary<string, ImmutableArray<IMethodSymbol>> extensiongMethods)
        {
            var copy = Copy();
            copy.ExtensionMethods = extensiongMethods;
            return copy;
        }

        public QueryableExpressionContext SetDocument(Document document)
        {
            var copy = Copy();
            copy.Document = document;
            return copy;
        }

        public QueryableExpressionContext SetCallerInfo(SymbolCallerInfo callerInfo)
        {
            var copy = Copy();
            copy.CallerInfo = callerInfo;
            return copy;
        }

        public QueryableExpressionContext SetExtensionMethodInvocation(InvocationExpressionSyntax extensionMethodInvocation)
        {
            var copy = Copy();
            copy.ExtensionMethodInvocation = extensionMethodInvocation;
            return copy;
        }

        public QueryableExpressionContext SetExtensionMethod(IMethodSymbol extensionMethod)
        {
            var copy = Copy();
            copy.ExtensionMethod = extensionMethod;
            return copy;
        }

        public QueryableExpressionContext SetInvocationSetDataFlowAnalysis(DataFlowAnalysis invocationDataFlowAnalysis)
        {
            var copy = Copy();
            copy.InvocationDataFlowAnalysis = invocationDataFlowAnalysis;
            return copy;
        }

        public QueryableExpressionContext AddErrorMessage(string errorMessage)
        {
            var copy = Copy();
            copy.ErrorMessages = ErrorMessages.Add(errorMessage);
            return copy;
        }

        public QueryableExpressionContext SetFilePath(string filePath)
        {
            var copy = Copy();
            copy.FilePath = filePath;
            return copy;
        }

        public QueryableExpressionContext SetLineNumber(int lineNumber)
        {
            var copy = Copy();
            copy.LineNumber = lineNumber;
            return copy;
        }

        public QueryableExpressionContext SetMethodName(string methodName)
        {
            var copy = Copy();
            copy.MethodName = methodName;
            return copy;
        }

        public override string ToString() =>
            $"{FilePath}, {MethodName}, Line {LineNumber}, {ExtensionMethod.ToDisplayString(SymbolDisplayFormat.CSharpShortErrorMessageFormat)}";
    
    }
}
