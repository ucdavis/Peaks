using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Reflection.Metadata;
using System.Runtime.Serialization;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Editing;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Storage;


namespace EfTestHelpers
{
    public class QueryableBuilder<T>: IEfQueryableBuilder<T>
        where T: DbContext
    {
        private QueryableExpressionContext _context;
        private string _outputIndent = "";

        private readonly QueryableScannerOptions _options;
        private readonly T _dbContext;

        public QueryableBuilder(QueryableScannerOptions options)
        {
            _options = options;
        }

        public IQueryable GetQueryable(T dbContext, QueryableExpressionContext context)
        {
            _context = context;

            var queryableArgumetnExpression = ExtractQueryableArgumentExpression(context);

            var getQueryable = TransformToLambda(context, queryableArgumetnExpression);

            return getQueryable?.Invoke(dbContext);
        }

        /// <summary>
        /// Convert expression syntax to a Func<T, IQueryable>
        /// </summary>
        private Func<T, IQueryable> TransformToLambda(QueryableExpressionContext context,
            ExpressionSyntax baseQueryableExpression)
        {
            var rootNodeContext = BuildNodeContextTree(context, baseQueryableExpression);

            var expression = (Expression<Func<T, IQueryable>>)rootNodeContext.Expression;

            var delagate = expression.Compile();

            return delagate;
        }

        private SyntaxNodeContext BuildNodeContextTree(QueryableExpressionContext context,
            ExpressionSyntax baseQueryableExpression)
        {
            _options.OutputWriteLine($"ORIGINAL EXPRESSION:{Environment.NewLine}{baseQueryableExpression}");

            var generator = SyntaxGenerator.GetGenerator(context.Solution.Workspace, baseQueryableExpression.Language);
            
            var nodeContexts = new Dictionary<SyntaxNode, SyntaxNodeContext>();

            foreach (var node in baseQueryableExpression.DescendantNodesAndSelf())
            {
                nodeContexts.Add(node, new SyntaxNodeContext(node, _context, nodeContexts));
            }

            // replace all expressions referencing captured variables with constants/default values
            var model = baseQueryableExpression.GetModel(_context.Solution);
            var analysis = model.AnalyzeDataFlow(baseQueryableExpression);

            // As we generate and replace nodes in the SyntaxTree, we can no longer reference original nodes.

            var identifierNodes = baseQueryableExpression.DescendantNodes().OfType<IdentifierNameSyntax>().ToArray();

            var rootNode = generator.ValueReturningLambdaExpression("dbContext", baseQueryableExpression);

            //wrap expression with a lambda taking a paramater named dbContext
            var rootNodeContext = SetReplacementNode(baseQueryableExpression, rootNode);


            // ensure all references to instance of DbContext are renamed to "dbContext"
            foreach (var identifier in identifierNodes
                .Where(node => node.GetSymbol(_context.Solution).GetClrType(node.GetModel(_context.Solution)) == typeof(T)))
            {
                SetReplacementNode(identifier, generator.IdentifierName("dbContext"));
            }

            foreach (var capturedSymbol in analysis.Captured.Where(s => s.CanBeReferencedByName))
            {
                foreach (var identifierNameSyntax in identifierNodes
                    .Where(node => SymbolEqualityComparer.Default.Equals(node.GetSymbol(_context.Solution), capturedSymbol)))
                {
                    var capturedExpression = identifierNameSyntax.AncestorsAndSelf()
                        .FirstOrDefault(node =>
                        {
                            // Use .Ancestors() instead of .Parent to ensure we don't get a trivia node
                            var parent = node.Ancestors().FirstOrDefault();
                            return parent is InvocationExpressionSyntax || parent is BinaryExpressionSyntax || parent is ArgumentListSyntax;
                        });

                    if (capturedExpression == null)
                        throw new InvalidOperationException("Unable to find a SyntaxNode for captured expression replacement");

                    var type = GetCapturedExpressionClrType(capturedExpression, model);

                    if (type.IsClass && _context.Solution.Projects.Any(p => type.Assembly.FullName.StartsWith(p.AssemblyName)))
                        continue;

                    var value = type.Instantiate();

                    SyntaxNode replacementExpression = generator.LiteralExpression(value);

                    switch (capturedExpression.Ancestors().First())
                    {
                        case ArgumentListSyntax argumentList:
                            replacementExpression = generator.Argument(replacementExpression.GetName(), RefKind.None, replacementExpression);
                            break;
                        case InvocationExpressionSyntax invocation:
                            break;
                        case BinaryExpressionSyntax binary:
                            break;
                        default:
                            throw new InvalidOperationException();
                    }

                    SetReplacementNode(capturedExpression, replacementExpression);
                }
            }

            var walker = new Walker(_options, _context, nodeContexts, rootNodeContext);
            walker.Visit(baseQueryableExpression);

            return rootNodeContext;

            SyntaxNodeContext SetReplacementNode(SyntaxNode originalNode, SyntaxNode replacementNode)
            {
                var originalNodeContext = nodeContexts[originalNode];
                originalNodeContext.ReplacementNode = replacementNode;
                nodeContexts[replacementNode] = originalNodeContext;

                //// TODO: Nodes created by SyntaxGenerator can contain descendant nodes. Determine if those descendant nodes also need to be mapped
                //foreach (var node in replacementNode.DescendantNodes())
                //{
                //    var nodeContext = new SyntaxNodeContext(null, _context, nodeContexts, node);
                //    nodeContext.OriginalOrReplacementNode = replacementNode;
                //    nodeContexts[replacementNode] = nodeContext;
                //}

                return originalNodeContext;
            }
        }

        private Type GetCapturedExpressionClrType(SyntaxNode capturedExpression, SemanticModel model)
        {
            var capturedExpressionSymbol = capturedExpression.GetSymbol(_context.Solution);
            var type = capturedExpressionSymbol?.GetClrType(model);

            if (type == null)
            {
                // Try a little harder to get type
                var parent = capturedExpression.Ancestors().FirstOrDefault(
                    node => node is InvocationExpressionSyntax || node is BinaryExpressionSyntax || node is ArgumentListSyntax);

                switch (parent)
                {
                    case InvocationExpressionSyntax invocationSyntax:
                        var invocationSymbol = invocationSyntax.GetSymbol(_context.Solution);
                        switch (invocationSymbol)
                        {
                            case IMethodSymbol methodSymbol:
                                type = GetInvocationArgumentClrType(invocationSyntax, capturedExpression, model);
                                break;
                            default:
                                throw new InvalidOperationException();
                        }

                        break;
                    case BinaryExpressionSyntax binarySyntax:
                        if (capturedExpressionSymbol is IMethodSymbol s)
                            type = s.ReturnType.GetClrType(model);
                        break;
                    case ArgumentListSyntax argumentListSyntax:
                        switch (argumentListSyntax.Ancestors().First())
                        {
                            case InvocationExpressionSyntax invocationSyntax:
                                type = GetInvocationArgumentClrType(invocationSyntax, capturedExpression, model);
                                break;
                            default:
                                throw new InvalidOperationException();
                        }

                        break;
                }
            }

            if (type == null)
                throw new InvalidOperationException();

            return type;
        }

        private Type GetInvocationArgumentClrType(InvocationExpressionSyntax invocationSyntax, SyntaxNode capturedExpression, SemanticModel model)
        {

            var invocationSymbol = invocationSyntax.GetSymbol(_context.Solution);
            Type type = null;
           
            switch (invocationSymbol)
            {
                case IMethodSymbol methodSymbol:
                    if (methodSymbol.MethodKind == MethodKind.ReducedExtension)
                        methodSymbol = methodSymbol.ReducedFrom;

                    var argIndex = -1;
                    if (methodSymbol.Parameters.Any())
                    {
                        if(invocationSyntax.ArgumentList.Arguments.Any())
                        {
                            var i = -1;
                            foreach (var argument in invocationSyntax.ArgumentList.Arguments)
                            {
                                i++;
                                if (argument.DescendantNodesAndSelf().All(node => node != capturedExpression)) continue;
                                argIndex = i;
                                break;
                            }
                        }
                    }

                    if (argIndex < 0)
                    {
                        type = methodSymbol.ReturnType.GetClrType(model);

                        if (type != null)
                            break;

                        throw new InvalidOperationException();
                    }

                    type = methodSymbol.Parameters[argIndex].GetClrType(model);
                    break;
                default:
                    throw new InvalidOperationException();
            }

            return type;
        }

        private static ExpressionSyntax ExtractQueryableArgumentExpression(QueryableExpressionContext context)
        {
            // get IQueryable expression from argument to invocation of method in EntityFrameworkQueryableExtensions
            ExpressionSyntax baseQueryableExpression = null;

            switch (context.ExtensionMethodInvocation.Expression)
            {
                case MemberAccessExpressionSyntax s:
                    switch (s.Expression)
                    {
                        case InvocationExpressionSyntax s2:
                            baseQueryableExpression = s2;
                            break;
                        case MemberAccessExpressionSyntax s2:
                            baseQueryableExpression = s2;
                            break;
                        default:
                            throw new InvalidOperationException();
                    }

                    break;
                default:
                    throw new InvalidOperationException();
            }

            return baseQueryableExpression;
        }

        /// <summary>
        /// Organizes a collection of <see cref="SyntaxNodeContext"/>s into a tree that is more readily digestible
        /// for creation of Linq expression
        /// </summary>
        private class Walker : CSharpSyntaxWalker
        {
            private QueryableExpressionContext _context;
            private string _outputIndent = "";

            private readonly Stack<SyntaxNodeContext> _nodeContextStack;
            private readonly QueryableScannerOptions _options;
            private readonly Dictionary<SyntaxNode, SyntaxNodeContext> _nodeContexts;
            private readonly SyntaxNodeContext _rootNodeContext;

            public Walker(QueryableScannerOptions options, QueryableExpressionContext context,
                Dictionary<SyntaxNode, SyntaxNodeContext> nodeContexts, SyntaxNodeContext rootNodeContext)
            {
                _options = options;
                _context = context;
                _nodeContexts = nodeContexts;
                _nodeContextStack = new Stack<SyntaxNodeContext>();
                _rootNodeContext = rootNodeContext;
            }

            private void LogVisitation(string s)
            {
                //_options.OutputWriteLine(s);
            }

#nullable enable

            public override void Visit(SyntaxNode node)
            {
                _outputIndent = _outputIndent + "    ";
                var nodeContext = _nodeContexts[node];
                // only visit node if it is not being replaced
                if (nodeContext.ReplacementNode == null || nodeContext == _rootNodeContext)
                    base.Visit(node);
                //// Don't visit node if it is not found in _nodeContexts, which will occur with descendants of replacement nodes
                //if (_nodeContexts.TryGetValue(node, out var nodeContext))
                //{
                //    // avoid visiting nodes that have been replaced...
                //    base.Visit(nodeContext.OriginalOrReplacementNode != node
                //        ? nodeContext.OriginalOrReplacementNode
                //        : node);
                //}
                //else
                //{
                //    // This node was likely created as a descendant of something generated by SyntaxGenerator.
                //    // Since the new nodeContext will not have an OriginalNode from the current compilation, available
                //    // info about it will be limited...
                //    var newNodeContext = new SyntaxNodeContext(null, _context, _nodeContexts, node);
                //    _nodeContexts.Add(node, newNodeContext);
                //    base.Visit(node);
                //}
                _outputIndent = _outputIndent.Substring(0, _outputIndent.Length - 4);
            }

            public override void VisitDefaultExpression(DefaultExpressionSyntax node)
            {
                base.VisitDefaultExpression(node);
                LogVisitation($"{_outputIndent}VisitDefaultExpression: {node}");

                var nodeContext = _nodeContexts[node];
                _nodeContextStack.Push(nodeContext);

                nodeContext.Expression = Expression.Default(nodeContext.Type);
            }

            public override void VisitArgumentList(ArgumentListSyntax node)
            {
                base.VisitArgumentList(node);
                LogVisitation($"{_outputIndent}VisitArgumentList: {node}");

                var nodeContext = _nodeContexts[node];

                _nodeContextStack.TryPeek(out var potentialArgumentNodeContext);

                if (!(potentialArgumentNodeContext?.ReplacementNode is ArgumentSyntax ||
                      potentialArgumentNodeContext?.ReplacementNode is MemberAccessExpressionSyntax))
                    throw new InvalidOperationException(
                        $"{nameof(ArgumentListSyntax)} {nameof(node)} should have at least one argument");

                _nodeContextStack.Pop();

                // first node can be either a MemberAccess or Argument
                nodeContext.AddComponentContext(potentialArgumentNodeContext);

                // subsequent nodes should all be ArgumentSyntax
                while (_nodeContextStack.TryPeek(out potentialArgumentNodeContext) &&
                       potentialArgumentNodeContext.ReplacementNode is ArgumentSyntax)
                {
                    _nodeContextStack.Pop();

                    nodeContext.AddComponentContext(potentialArgumentNodeContext);
                }

                _nodeContextStack.Push(nodeContext);
            }

            public override void VisitArgument(ArgumentSyntax node)
            {
                base.VisitArgument(node);
                LogVisitation($"{_outputIndent}VisitArgument: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var argumentExpressioNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(argumentExpressioNodeContext)} found for {nameof(ArgumentSyntax)} {node}");

                nodeContext.AddComponentContext(argumentExpressioNodeContext);

                _nodeContextStack.Push(nodeContext);

                //// just pass the argumentExpressionContext.Expression up to its parent 
                //nodeContext.Expression = argumentExpressionContext.GetExpression();
            }

            public override void VisitParameter(ParameterSyntax node)
            {
                base.VisitParameter(node);
                LogVisitation($"{_outputIndent}VisitParameter: {node}");

                var nodeContext = _nodeContexts[node];

                if (_nodeContextStack.TryPeek(out var parameterExpressioNodeContext) && parameterExpressioNodeContext.ReplacementNode is IdentifierNameSyntax)
                {
                    nodeContext.AddComponentContext(parameterExpressioNodeContext);
                    _nodeContextStack.Pop();
                }

                _nodeContextStack.Push(nodeContext);
            }

            public override void VisitInvocationExpression(InvocationExpressionSyntax node)
            {
                base.VisitInvocationExpression(node);
                LogVisitation($"{_outputIndent}VisitInvocationExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var methodOrDelegateNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(methodOrDelegateNodeContext)} found for {nameof(InvocationExpressionSyntax)} {node}");

                if (_nodeContextStack.TryPop(out var argumentListNodeContext))
                {
                    nodeContext.AddComponentContext(argumentListNodeContext);
                }

                nodeContext.AddComponentContext(methodOrDelegateNodeContext);

                _nodeContextStack.Push(nodeContext);

                var argumentListContext = nodeContext.ComponentContexts
                    .Skip(1)
                    .FirstOrDefault();

                var argumentExpressions =
                    argumentListContext?.ReplacementNode is ArgumentListSyntax l
                        ? argumentListContext.ComponentContexts
                            .Select(c => c.Expression)
                            .ToArray()
                        : new Expression[] { };

                var instanceExpression = methodOrDelegateNodeContext.Expression;
                var methodInfo = methodOrDelegateNodeContext.GetMethodInfo();

                nodeContext.Expression = Expression.Call(instanceExpression, methodInfo, argumentExpressions);
                //TODO: Do we ever need to use Expression.Invoke()?

            }

            public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
            {
                base.VisitMemberAccessExpression(node);
                LogVisitation($"{_outputIndent}VisitMemberAccessExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var memberNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(memberNodeContext)} found for {nameof(MemberAccessExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var containingNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(containingNodeContext)} found for {nameof(MemberAccessExpressionSyntax)} {node}");

                nodeContext.AddComponentContext(containingNodeContext);
                nodeContext.AddComponentContext(memberNodeContext);

                _nodeContextStack.Push(nodeContext);

                var containingType = containingNodeContext.Type;
                var memberInfo = memberNodeContext.GetMemberInfo();

                nodeContext.Expression =
                    Expression.MakeMemberAccess(containingNodeContext.Expression, memberInfo);
            }



            public override void VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
            {
                base.VisitSimpleLambdaExpression(node);
                LogVisitation($"{_outputIndent}VisitSimpleLambdaExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var argumentListContext))
                    throw new InvalidOperationException(
                        $"No {nameof(argumentListContext)} found for {nameof(SimpleLambdaExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var lambdaBodyContext))
                    throw new InvalidOperationException(
                        $"No {nameof(lambdaBodyContext)} found for {nameof(SimpleLambdaExpressionSyntax)} {node}");

                nodeContext.AddComponentContext(lambdaBodyContext);
                nodeContext.AddComponentContext(argumentListContext);

                _nodeContextStack.Push(nodeContext);

                var bodyExpression = lambdaBodyContext.Expression;

                argumentListContext = nodeContext.ComponentContexts
                    .Skip(1)
                    .FirstOrDefault();

                var parameterExpressions =
                    argumentListContext?.ReplacementNode is ArgumentListSyntax
                        ? argumentListContext.ComponentContexts
                            .Select(c => Expression.Parameter(c.Type, c.ReplacementNode.GetName()))
                            .ToArray()
                        : new ParameterExpression[] { };

                nodeContext.Expression = Expression.Lambda(bodyExpression, false, parameterExpressions);

            }

            public override void VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
            {
                base.VisitParenthesizedLambdaExpression(node);
                LogVisitation($"{_outputIndent}VisitParenthesizedLambdaExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var argumentListContext))
                    throw new InvalidOperationException(
                        $"No {nameof(argumentListContext)} found for {nameof(ParenthesizedLambdaExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var lambdaBodyContext))
                    throw new InvalidOperationException(
                        $"No {nameof(lambdaBodyContext)} found for {nameof(ParenthesizedLambdaExpressionSyntax)} {node}");

                nodeContext.AddComponentContext(lambdaBodyContext);
                nodeContext.AddComponentContext(argumentListContext);

                _nodeContextStack.Push(nodeContext);

                var bodyExpression = lambdaBodyContext.Expression;

                argumentListContext = nodeContext.ComponentContexts
                    .Skip(1)
                    .FirstOrDefault();

                var parameterExpressions =
                    argumentListContext?.ReplacementNode is ArgumentListSyntax
                        ? argumentListContext.ComponentContexts
                            .Select(c => Expression.Parameter(c.Type, c.ReplacementNode.GetName()))
                            .ToArray()
                        : new ParameterExpression[] { };

                nodeContext.Expression = Expression.Lambda(bodyExpression, false, parameterExpressions);

            }

            public override void VisitBinaryExpression(BinaryExpressionSyntax node)
            {
                base.VisitBinaryExpression(node);
                LogVisitation($"{_outputIndent}VisitBinaryExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var rightNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(rightNodeContext)} found for {nameof(BinaryExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var leftNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(leftNodeContext)} found for {nameof(BinaryExpressionSyntax)} {node}");

                nodeContext.AddComponentContext(leftNodeContext);
                nodeContext.AddComponentContext(rightNodeContext);

                _nodeContextStack.Push(nodeContext);

                //ExpressionType expressionType = nodeContext.Symbol as Ibin

                //Expression.MakeBinary()
            }

            public override void VisitIdentifierName(IdentifierNameSyntax node)
            {
                base.VisitIdentifierName(node);
                LogVisitation($"{_outputIndent}VisitIdentifierName: {node}");

                var nodeContext = _nodeContexts[node];
                _nodeContextStack.Push(nodeContext);

                if (nodeContext.Type?.ImplementsOrDerives(typeof(DbContext)) ?? false)
                {
                    nodeContext.Expression = Expression.Parameter(nodeContext.Type, node.Identifier.Text);
                    return;
                }

                switch (nodeContext.Symbol)
                {
                    case IFieldSymbol _:
                    case IPropertySymbol _:
                        var parentNode = nodeContext.OriginalNode.Ancestors().First();
                        var parentSyntax = nodeContext.AllContexts[parentNode];
                        var containingExpression = parentSyntax.Expression;
                        nodeContext.Expression =
                            Expression.PropertyOrField(containingExpression, node.Identifier.Text);
                        break;
                    default:
                        throw new InvalidOperationException();
                }
            }

            public override void VisitLiteralExpression(LiteralExpressionSyntax node)
            {
                base.VisitLiteralExpression(node);
                LogVisitation($"{_outputIndent}VisitLiteralExpression: {node}");

                var nodeContext = _nodeContexts[node];
                _nodeContextStack.Push(nodeContext);


                nodeContext.Expression = Expression.Constant(node.Token.Value);
            }
#nullable disable
        }
    }

    public interface IEfQueryableBuilder<in T>
        where T: DbContext
    {
        public IQueryable GetQueryable(T dbContext, QueryableExpressionContext context);
    }
}
