using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Text;
using Microsoft.CodeAnalysis;

namespace EfTestHelpers
{
    /// <summary>
    /// Holds a Linq expression, any symbols and/or nodes that went into creation of it and corresponding
    /// component LinqExpressionContexts representing sub-expressions.
    /// </summary>
    public class LinqExpressionContext
    {
        public string CreatedBy { get; }

        public Expression Expression { get; private set; }

        public ImmutableList<SymbolNodePair> SymbolNodePairs { get; private set; } = ImmutableList<SymbolNodePair>.Empty;

        public ImmutableList<LinqExpressionContext> ComponentContexts { get; private set; } = ImmutableList<LinqExpressionContext>.Empty;

        internal LinqExpressionContext([CallerMemberName] string createdBy = "")
        {
            CreatedBy = createdBy;
        }

        private LinqExpressionContext Copy()
        {
            return new LinqExpressionContext(CreatedBy)
            {
                Expression = Expression,
                SymbolNodePairs = SymbolNodePairs,
                ComponentContexts = ComponentContexts
            };
        }

        public LinqExpressionContext SetExpression(Expression expression)
        {
            var copy = Copy();
            copy.Expression = expression;
            return copy;
        }

        public LinqExpressionContext AddSymbolNodePair(SymbolNodePair symbolNodePair)
        {
            var copy = Copy();
            copy.SymbolNodePairs = SymbolNodePairs.Add(symbolNodePair);
            return copy;
        }

        public LinqExpressionContext AddSymbolNodePairs(IEnumerable<SymbolNodePair> symbolNodePairs)
        {
            var copy = Copy();
            copy.SymbolNodePairs = SymbolNodePairs.AddRange(symbolNodePairs);
            return copy;
        }

        public LinqExpressionContext AddComponentContext(LinqExpressionContext context)
        {
            var copy = Copy();
            copy.ComponentContexts = ComponentContexts.Add(context);
            return copy;
        }
    }
}
