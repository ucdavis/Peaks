using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Storage;


namespace EfTestHelpers
{
    public class EfQueryableBuilder2 : IEfQueryableBuilder
    {
        private LinqToEfSanityCheckerOptions _options;

        public EfQueryableBuilder2(LinqToEfSanityCheckerOptions options)
        {
            _options = options;

        }

        public IQueryable GetQueryable(DbContext dbContext, LinqToEfSanityCheckerContext context)
        {
            _options.OutputWriteLine($"{context.ExtensionMethodInvocation}");
            return null;
        }
    }

    public class EfQueryableBuilder: CSharpSyntaxRewriter, IEfQueryableBuilder
    {
        private LinqToEfSanityCheckerContext _context;
        private string _outputIndent = "";

        private readonly Stack<LinqExpressionContext> _expressionContexts;
        private readonly LinqToEfSanityCheckerOptions _options;

        private Type rootDbContextType;
        private string rootDbSetPropertName;
        private Type rootDbSetType; // This is a closed type of DbSet`1

        //TODO: Decide how much magic involved in building this delegate
        //There be dragons instantiating rootDbContextType ourselves. Maybe just have a callback
        //for api consumer to provide a DbSet based on rootDbContextType and rootDbSetPropertName?
        private Func<DbContext, IQueryable> _getRootQueryable;

        public EfQueryableBuilder(LinqToEfSanityCheckerOptions options)
        {
            _options = options;
            _expressionContexts = new Stack<LinqExpressionContext>();

            //AssemblyLoadContext.Default
        }

        public IQueryable GetQueryable(DbContext dbContext, LinqToEfSanityCheckerContext context)
        {
            _context = context;

            Visit(context.ExtensionMethodInvocation);

            //not there yet
            return null;
        }

#nullable enable

        public override SyntaxNode Visit(SyntaxNode node)
        {
            _outputIndent = _outputIndent + "    ";
            var visitedNode = base.Visit(node);
            _outputIndent = _outputIndent.Substring(0, _outputIndent.Length - 4);
            return visitedNode;
        }

        public override SyntaxNode? VisitDefaultExpression(DefaultExpressionSyntax node)
        {
            var visitedNode = base.VisitDefaultExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitDefaultExpression: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitArgumentList(ArgumentListSyntax node)
        {
            var visitedNode = base.VisitArgumentList(node);
            _options.OutputWriteLine($"{_outputIndent}VisitArgumentList: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitArgument(ArgumentSyntax node)
        {
            var visitedNode = base.VisitArgument(node);
            _options.OutputWriteLine($"{_outputIndent}VisitArgument: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
        {
            var visitedNode = base.VisitInvocationExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitInvocationExpression: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
        {
            var visitedNode = base.VisitMemberAccessExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitMemberAccessExpression: {node}");
            
            if (!node.IsKind(SyntaxKind.SimpleMemberAccessExpression))
                throw new NotSupportedException($"MemberAccessExpression.Kind {node.Kind()}");

            if (!_expressionContexts.TryPeek(out var memberContext))
                throw new InvalidOperationException(
                    "Did not find a member ExpressionContext for MemberAccessExpression arguments");

            if (memberContext.SymbolNodePairs[0].Symbol is IMethodSymbol methodSymbol)
            {
                // Linq has no concept of a MemberAccessExpression representing a method, but instead
                // has a MethodCallExpression. Ignore this node and let the parent node
                // (VisitInvocationExpression) create the MethodCallExpression
                return visitedNode;
            }

            // remove memberContext
            _expressionContexts.Pop();

            var memberType = memberContext.SymbolNodePairs[0].Symbol.GetClrType();
            var memberName = memberContext.SymbolNodePairs[0].Symbol.Name;

            if (!_expressionContexts.TryPop(out var ownerContext) && !_expressionContexts.Any())
                throw new InvalidOperationException(
                    "Did not find an owner ExpressionContext for MemberAccessExpression arguments");


            var ownerType = ownerContext.SymbolNodePairs[0].Symbol.GetClrType();
            
            var model = ownerContext.SymbolNodePairs[0].SyntaxNode.GetModel(_context.Solution);

            var dataFlow = model.AnalyzeDataFlow(ownerContext.SymbolNodePairs[0].SyntaxNode);

            var memberInfo = ownerType.GetMember(memberName);

            var memberAccessContext = new LinqExpressionContext()
                .SetExpression(Expression.MakeMemberAccess(ownerContext.Expression, memberInfo[0]))
                .AddComponentContext(ownerContext)
                .AddComponentContext(memberContext)
                .AddSymbolNodePair(node.GetSymbolNodePair(_context.Solution));

            _expressionContexts.Push(memberAccessContext);

            return visitedNode;
        }



        public override SyntaxNode? VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
        {
            var visitedNode = base.VisitSimpleLambdaExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitSimpleLambdaExpression: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
        {
            var visitedNode = base.VisitParenthesizedLambdaExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitParenthesizedLambdaExpression: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitBinaryExpression(BinaryExpressionSyntax node)
        {
            var visitedNode = base.VisitBinaryExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitBinaryExpression: {node}");
            return visitedNode;
        }

        public override SyntaxNode? VisitIdentifierName(IdentifierNameSyntax node)
        {
            var visitedNode = base.VisitIdentifierName(node);
            _options.OutputWriteLine($"{_outputIndent}VisitIdentifierName: {node}");
            var pair = node.GetSymbolNodePair(_context.Solution);
            var expressionContext = new LinqExpressionContext().AddSymbolNodePair(pair);
            switch (pair.Symbol)
            {
                case IMethodSymbol _:
                case INamedTypeSymbol _:
                    break;
                default:
                    expressionContext = expressionContext.SetExpression(Expression.Variable(pair.Symbol.GetClrType(), pair.Symbol.Name));
                    break;
            }
            _expressionContexts.Push(expressionContext);
            return visitedNode;
        }

        public override SyntaxNode? VisitLiteralExpression(LiteralExpressionSyntax node)
        {
            var visitedNode = base.VisitLiteralExpression(node);
            _options.OutputWriteLine($"{_outputIndent}VisitLiteralExpression: {node}");
            var expressionContext = new LinqExpressionContext()
                .SetExpression(Expression.Constant(node.Token.Value))
                .AddSymbolNodePair(node.GetSymbolNodePair(_context.Solution));
            _expressionContexts.Push(expressionContext);
            return visitedNode;
        }
#nullable disable
    }

    public interface IEfQueryableBuilder
    {
        public IQueryable GetQueryable(DbContext dbContext, LinqToEfSanityCheckerContext context);
    }
}
