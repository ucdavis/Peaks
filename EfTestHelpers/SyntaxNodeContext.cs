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
        public SyntaxNode SyntaxNode { get; set; }
        //public SyntaxNode ReplacementNode { get; set; }
        public SemanticModel Model { get; set; }
        public Type Type { get; set; }
        public Expression Expression { get; set; }
        public Stack<SyntaxNodeContext> ComponentContexts { get; set; }
        public SyntaxNodeContext ParentContext { get; set; }
        public Dictionary<SyntaxNode, SyntaxNodeContext> AllContexts { get; set; }

        public SyntaxNodeContext(SyntaxNode syntaxNode, QueryableExpressionContext expressionContext,
            Dictionary<SyntaxNode, SyntaxNodeContext> allContexts, SyntaxNode replacementNode = null)
        {
            ComponentContexts = new Stack<SyntaxNodeContext>();
            SyntaxNode = syntaxNode;
            Symbol = syntaxNode?.GetSymbol(expressionContext.Solution);
            Model = syntaxNode?.GetModel(expressionContext.Solution);
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
                return/* ReplacementNode?.ToString() ??*/ SyntaxNode.ToString();

            var sb = new StringBuilder();
            sb.Append($"{/*ReplacementNode ??*/ SyntaxNode}{Environment.NewLine}    [{ComponentContexts.First()}");

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
            switch (nodeContext.Symbol)
            {
                case IPropertySymbol s:
                    var containingType = s.ContainingType.GetClrType(nodeContext.Model);
                    return containingType.GetProperty(s.Name);
                case IFieldSymbol s:
                    containingType = s.ContainingType.GetClrType(nodeContext.Model);
                    return containingType.GetField(s.Name);
                default:
                    throw new InvalidOperationException();
            }
        }
    }
}
