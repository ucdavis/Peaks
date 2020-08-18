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
    public class LinqToEfSanityCheckerContext
    {
        public Solution Solution { get; private set; }
        public Project Project { get; private set; }
        public Compilation Compilation { get; private set; }
        public Document Document { get; private set; }
        public SymbolCallerInfo CallerInfo { get; private set; }
        public InvocationExpressionSyntax ExtensionMethodInvocation { get; private set; }
        public IMethodSymbol ExtensionMethod { get; private set; }
        public QueryableExtensionsOwner ExtensionMethodOwner { get; private set; }
        public DataFlowAnalysis InvocationDataFlowAnalysis { get; private set; }
        public ImmutableList<string> ErrorMessages { get; private set; } = ImmutableList<string>.Empty;
        public string FilePath { get; private set; }
        public int LineNumber { get; private set; }
        public string MethodName { get; private set; }

        internal LinqToEfSanityCheckerContext()
        {
        }

        private LinqToEfSanityCheckerContext Copy()
        {
            return new LinqToEfSanityCheckerContext
            {
                Solution = Solution,
                Project = Project,
                Compilation = Compilation,
                Document = Document,
                CallerInfo = CallerInfo,
                ExtensionMethodInvocation = ExtensionMethodInvocation,
                ExtensionMethod = ExtensionMethod,
                ExtensionMethodOwner = ExtensionMethodOwner,
                InvocationDataFlowAnalysis = InvocationDataFlowAnalysis,
                ErrorMessages = ErrorMessages,
                FilePath = FilePath,
                LineNumber = LineNumber,
                MethodName = MethodName
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

        public LinqToEfSanityCheckerContext SetExtensionMethodInvocation(InvocationExpressionSyntax extensionMethodInvocation)
        {
            var copy = Copy();
            copy.ExtensionMethodInvocation = extensionMethodInvocation;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetExtensionMethod(IMethodSymbol extensionMethod)
        {
            var copy = Copy();
            copy.ExtensionMethod = extensionMethod;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetExtensionMethodOwner(QueryableExtensionsOwner owner)
        {
            var copy = Copy();
            copy.ExtensionMethodOwner = owner;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetInvocationSetDataFlowAnalysis(DataFlowAnalysis invocationDataFlowAnalysis)
        {
            var copy = Copy();
            copy.InvocationDataFlowAnalysis = invocationDataFlowAnalysis;
            return copy;
        }

        public LinqToEfSanityCheckerContext AddErrorMessage(string errorMessage)
        {
            var copy = Copy();
            copy.ErrorMessages = ErrorMessages.Add(errorMessage);
            return copy;
        }

        public LinqToEfSanityCheckerContext SetFilePath(string filePath)
        {
            var copy = Copy();
            copy.FilePath = filePath;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetLineNumber(int lineNumber)
        {
            var copy = Copy();
            copy.LineNumber = lineNumber;
            return copy;
        }

        public LinqToEfSanityCheckerContext SetMethodName(string methodName)
        {
            var copy = Copy();
            copy.MethodName = methodName;
            return copy;
        }

        public override string ToString() =>
            $"{FilePath}, {MethodName}, Line {LineNumber}, {ExtensionMethodOwner} {ExtensionMethod.ToDisplayString(SymbolDisplayFormat.CSharpShortErrorMessageFormat)}";
    
    }
}
