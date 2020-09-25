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
        public Dictionary<SyntaxNode, SyntaxNodeContext> AllContexts { get; set; }
        public IQueryable Queryable { get; set; }

        public SyntaxNodeContext(SyntaxNode syntaxNode, QueryableExpressionContext expressionContext,
            Dictionary<SyntaxNode, SyntaxNodeContext> allContexts, SyntaxNode replacementNode = null)
        {
            SyntaxNode = syntaxNode;
            Symbol = syntaxNode?.GetSymbol(expressionContext.Solution);
            Model = syntaxNode?.GetModel(expressionContext.Solution);
            Type = Symbol?.GetClrType(Model);
            AllContexts = allContexts;
        }

        public override string ToString()
        {
            return SyntaxNode.ToString();
        }
    }

    public static class SyntaxNodeContextExtensions
    {

        public static (MethodInfo methodInfo, object[] arguments) GetMethodAndArguments(this SyntaxNodeContext nodeContext)
        {
            if (nodeContext.Symbol is IMethodSymbol originalMethodSymbol && nodeContext.SyntaxNode is InvocationExpressionSyntax invocationSyntax)
            {
                var methodSymbol = originalMethodSymbol.ReducedFrom ?? originalMethodSymbol;

                var containingType = methodSymbol.ContainingType.GetClrType(nodeContext.Model);
                var methodInfo = containingType.GetMethods().FirstOrDefault(
                    m => m.Name == methodSymbol.Name
                         && m.IsStatic == methodSymbol.IsStatic
                         && m.IsGenericMethodDefinition == methodSymbol.IsGenericMethod
                         && m.GetGenericArguments().Length == methodSymbol.TypeArguments.Length
                         && m.GetParameters().Length == methodSymbol.Parameters.Length
                         // if not a generic method definition, be sure the parameter types match...
                         && (m.IsGenericMethodDefinition || m.GetParameters()
                             .Select(p => p.ParameterType)
                             .SequenceEqual(methodSymbol.Parameters.Select(p => p.GetClrType(nodeContext.Model)))));

                var argumentNodeContexts = invocationSyntax.ArgumentList.Arguments
                    .Select(a => nodeContext.AllContexts[a.Expression])
                    .ToList();

                if (methodInfo.IsGenericMethodDefinition)
                {

                    // extension method calls are interpereted as MemberAccessExpressions in which the child Expression is the first/this argument
                    if (originalMethodSymbol.ReducedFrom != null && methodSymbol.IsExtensionMethod && invocationSyntax.Expression is MemberAccessExpressionSyntax memberAccess)
                        argumentNodeContexts.Insert(0, nodeContext.AllContexts[memberAccess.Expression]);
                    
                    // try to get correct type arguments for constructing generic method...
                    var typeArguments = argumentNodeContexts
                        .SelectMany(c => (c.Queryable?.GetType() ?? c.Expression?.Type ?? typeof(object)).GetTypeInfo().GenericTypeArguments)
                        .Where(t => t != typeof(bool)) // ignore predicate return types
                        .Distinct()
                        .ToArray();

                    methodInfo = methodInfo.MakeGenericMethod(typeArguments);
                }

                var arguments = argumentNodeContexts.Select(c => (object) c.Queryable ?? c.Expression).ToArray();

                return (methodInfo, arguments);
            }

            throw new InvalidOperationException();
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
