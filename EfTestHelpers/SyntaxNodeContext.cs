using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Internal;

namespace EfTestHelpers
{
    public class SyntaxNodeContext
    {
        public QueryableExpressionContext ExpressionContext { get; set; }
        public ISymbol Symbol { get; set; }
        public SyntaxNode OriginalNode { get; set; }
        public SyntaxNode ReplacementNode { get; set; }
        public SemanticModel Model { get; set; }
        public Type Type { get; set; }
        public Expression Expression { get; set; }
        public Stack<SyntaxNodeContext> ComponentContexts { get; set; }
        public SyntaxNodeContext ParentContext { get; set; }
        public Dictionary<SyntaxNode, SyntaxNodeContext> AllContexts { get; set; }

        public SyntaxNodeContext(SyntaxNode originalNode, QueryableExpressionContext expressionContext,
            Dictionary<SyntaxNode, SyntaxNodeContext> allContexts, SyntaxNode replacementNode = null)
        {
            ComponentContexts = new Stack<SyntaxNodeContext>();
            OriginalNode = originalNode;
            Symbol = originalNode?.GetSymbol(expressionContext.Solution);
            Model = originalNode?.GetModel(expressionContext.Solution);
            Type = Symbol?.GetClrType(Model);
            AllContexts = allContexts;
        }

        public override string ToString()
        {
            return ToString(includeComponentContexts: true);
        }

        public string ToString(bool includeComponentContexts)
        {
            if (!includeComponentContexts || !ComponentContexts.Any())
                return ReplacementNode?.ToString() ?? OriginalNode.ToString();

            var sb = new StringBuilder();
            sb.Append($"{ReplacementNode ?? OriginalNode}{Environment.NewLine}    [{ComponentContexts.First()}");

            foreach (var component in ComponentContexts.Skip(1))
            {
                sb.Append($",{Environment.NewLine}    {component.ToString(includeComponentContexts: false)}");
            }

            sb.Append("]");

            return sb.ToString();
        }
    }

    public static class SyntaxNodeContextExtensions
    {

        public static void AddComponentContext(this SyntaxNodeContext containingNodeContext, SyntaxNodeContext componentNodeContext)
        {
            containingNodeContext.ComponentContexts.Push(componentNodeContext);
            componentNodeContext.ParentContext = containingNodeContext;
        }

        public static MethodInfo GetMethodInfo(this SyntaxNodeContext nodeContext)
        {
            throw new NotImplementedException();
        }

        public static MemberInfo GetMemberInfo(this SyntaxNodeContext nodeContext)
        {
            throw new NotImplementedException();
        }

    }
}
