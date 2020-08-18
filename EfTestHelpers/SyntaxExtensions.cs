using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using Gu.Roslyn.AnalyzerExtensions;
using Microsoft.CodeAnalysis;


namespace EfTestHelpers
{
    public static class SyntaxExtensions
    {
        private static readonly ConcurrentDictionary<SyntaxTree, SemanticModel> MapTreesToModels =
            new ConcurrentDictionary<SyntaxTree, SemanticModel>();

        public static int GetLineNumber(this SyntaxNode syntaxNode)
        {
            return syntaxNode.SyntaxTree.GetLineSpan(syntaxNode.Span).StartLinePosition.Line;
        }

        public static SymbolNodePair GetSymbolNodePair(this SyntaxNode node, Solution solution)
        {
            var model = node.GetModel(solution);
            var info = model.GetSymbolInfo(node);
            return new SymbolNodePair{SyntaxNode =  node, Symbol = info.Symbol};
        }

        public static SemanticModel GetModel(this SyntaxNode node, Solution solution)
        {
            return node.SyntaxTree.GetModel(solution);
        }

        public static SemanticModel GetModel(this SyntaxTree tree, Solution solution)
        {
            if (solution == null)
            {
                throw new ArgumentNullException(nameof(solution));
            }

            return MapTreesToModels.GetOrAdd(tree,
                key => solution.GetDocument(tree).GetSemanticModelAsync().GetAwaiter().GetResult());
        }
    }
}
