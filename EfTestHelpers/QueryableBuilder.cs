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
    /// <summary>
    /// 
    /// </summary>
    /// <remarks>
    /// Challenges:
    ///  * Roslyn has no concept of Linq expressions, so they must be constructed based on what
    ///    extension methods they are passed into. If an extension method takes a bool predicate in
    ///    addition to a IQueryable, an additional EntityFrameworkQueryableExtensions.Where() call
    ///    needs to be applied for that predicate.
    ///  * Roslyn does not provide any mechanism for mapping SemanticModel symbols to actual types
    ///    in the executing runtime, so they must be manually mapped via reflection
    /// </remarks>
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

            //var generator = SyntaxGenerator.GetGenerator(context.Solution.Workspace, baseQueryableExpression.Language);
            
            var nodeContexts = new Dictionary<SyntaxNode, SyntaxNodeContext>();

            foreach (var node in baseQueryableExpression.DescendantNodesAndSelf())
            {
                nodeContexts.Add(node, new SyntaxNodeContext(node, _context, nodeContexts));
            }

            //// replace all expressions referencing captured variables with constants/default values
            var model = baseQueryableExpression.GetModel(_context.Solution);
            //var analysis = model.AnalyzeDataFlow(baseQueryableExpression);

            //// As we generate and replace nodes in the SyntaxTree, we can no longer reference original nodes.

            //var identifierNodes = baseQueryableExpression.DescendantNodes().OfType<IdentifierNameSyntax>().ToArray();

            //var rootNode = generator.ValueReturningLambdaExpression("dbContext", baseQueryableExpression);

            ////wrap expression with a lambda taking a paramater named dbContext
            //var rootNodeContext = SetReplacementNode(baseQueryableExpression, rootNode);
            var rootNodeContext = nodeContexts[baseQueryableExpression];


            //// ensure all references to instance of DbContext are renamed to "dbContext"
            //foreach (var identifier in identifierNodes
            //    .Where(node => node.GetSymbol(_context.Solution).GetClrType(node.GetModel(_context.Solution)) == typeof(T)))
            //{
            //    SetReplacementNode(identifier, generator.IdentifierName("dbContext"));
            //}

            //foreach (var capturedSymbol in analysis.Captured.Where(s => s.CanBeReferencedByName))
            //{
            //    foreach (var identifierNameSyntax in identifierNodes
            //        .Where(node => SymbolEqualityComparer.Default.Equals(node.GetSymbol(_context.Solution), capturedSymbol)))
            //    {
            //        var capturedExpression = identifierNameSyntax.AncestorsAndSelf()
            //            .FirstOrDefault(node =>
            //            {
            //                // Use .Ancestors() instead of .Parent to ensure we don't get a trivia node
            //                var parent = node.Ancestors().FirstOrDefault();
            //                return parent is InvocationExpressionSyntax || parent is BinaryExpressionSyntax || parent is ArgumentListSyntax;
            //            });

            //        if (capturedExpression == null)
            //            throw new InvalidOperationException("Unable to find a SyntaxNode for captured expression replacement");

            //        var type = GetCapturedExpressionClrType(capturedExpression, model);

            //        if (type.IsClass && _context.Solution.Projects.Any(p => type.Assembly.FullName.StartsWith(p.AssemblyName)))
            //            continue;

            //        var value = type.Instantiate();

            //        SyntaxNode replacementExpression = generator.LiteralExpression(value);

            //        switch (capturedExpression.Ancestors().First())
            //        {
            //            case ArgumentListSyntax argumentList:
            //                replacementExpression = generator.Argument(replacementExpression.GetName(), RefKind.None, replacementExpression);
            //                break;
            //            case InvocationExpressionSyntax invocation:
            //                break;
            //            case BinaryExpressionSyntax binary:
            //                break;
            //            default:
            //                throw new InvalidOperationException();
            //        }

            //        SetReplacementNode(capturedExpression, replacementExpression);
            //    }
            //}

            var walker = new Walker(_options, _context, nodeContexts);//, rootNodeContext);
            walker.Visit(baseQueryableExpression);

            return rootNodeContext;

            //SyntaxNodeContext SetReplacementNode(SyntaxNode originalNode, SyntaxNode replacementNode)
            //{
            //    var originalNodeContext = nodeContexts[originalNode];
            //    originalNodeContext.ReplacementNode = replacementNode;
            //    nodeContexts[replacementNode] = originalNodeContext;

            //    //// TODO: Nodes created by SyntaxGenerator can contain descendant nodes. Determine if those descendant nodes also need to be mapped
            //    //foreach (var node in replacementNode.DescendantNodes())
            //    //{
            //    //    var nodeContext = new SyntaxNodeContext(null, _context, nodeContexts, node);
            //    //    nodeContext.OriginalOrReplacementNode = replacementNode;
            //    //    nodeContexts[replacementNode] = nodeContext;
            //    //}

            //    return originalNodeContext;
            //}
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

        //TODO: Climb expression until we get to DbSet, extracting chain of calls after we are outside of what will be converted to Linq expression tree
        //TODO: Then construct a delegate that takes a DbContext and calls those methods on the given DbSet,

        private static ExpressionSyntax ExtractQueryableArgumentExpression(QueryableExpressionContext context)
        {
            // get IQueryable expression from argument to invocation of method in EntityFrameworkQueryableExtensions
            ExpressionSyntax baseQueryableExpression = null;
            ExpressionSyntax predicateExpression = null;

            switch (context.ExtensionMethodInvocation.Expression)
            {
                case MemberAccessExpressionSyntax s:
                    switch (s.Expression)
                    {
                        case InvocationExpressionSyntax s2:
                            baseQueryableExpression = s2.ArgumentList.Arguments.FirstOrDefault()?.Expression ?? s2;
                            predicateExpression = s2.ArgumentList.Arguments.Skip(1).FirstOrDefault()?.Expression as SimpleLambdaExpressionSyntax;
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
            //private readonly SyntaxNodeContext _rootNodeContext;

            public Walker(QueryableScannerOptions options, QueryableExpressionContext context,
                Dictionary<SyntaxNode, SyntaxNodeContext> nodeContexts)//, SyntaxNodeContext rootNodeContext)
            {
                _options = options;
                _context = context;
                _nodeContexts = nodeContexts;
                _nodeContextStack = new Stack<SyntaxNodeContext>();
                //_rootNodeContext = rootNodeContext;
            }

            private void LogVisitation(string s)
            {
                _options.OutputWriteLine(s);
            }

#nullable enable

            public override void Visit(SyntaxNode node)
            {
                _outputIndent = _outputIndent + "    ";
                //var nodeContext = _nodeContexts[node];
                //// only visit node if it is not being replaced
                //if (nodeContext.ReplacementNode == null || nodeContext == _rootNodeContext)
                    base.Visit(node);
                _outputIndent = _outputIndent.Substring(0, _outputIndent.Length - 4);
            }

            public override void VisitDefaultExpression(DefaultExpressionSyntax node)
            {
                base.VisitDefaultExpression(node);
                LogVisitation($"{_outputIndent}VisitDefaultExpression: {node}");

                var nodeContext = _nodeContexts[node];
                nodeContext.Expression = Expression.Default(nodeContext.Type);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

                _nodeContextStack.Push(nodeContext);
            }

            public override void VisitArgumentList(ArgumentListSyntax node)
            {
                base.VisitArgumentList(node);
                LogVisitation($"{_outputIndent}VisitArgumentList: {node}");

                var nodeContext = _nodeContexts[node];

                _nodeContextStack.TryPeek(out var potentialArgumentNodeContext);

                if (!(potentialArgumentNodeContext?.SyntaxNode is ArgumentSyntax ||
                      potentialArgumentNodeContext?.SyntaxNode is MemberAccessExpressionSyntax))
                    throw new InvalidOperationException(
                        $"{nameof(ArgumentListSyntax)} {nameof(node)} should have at least one argument");

                _nodeContextStack.Pop();

                // first node can be either a MemberAccess or Argument
                nodeContext.AddComponentContext(potentialArgumentNodeContext);

                // subsequent nodes should all be ArgumentSyntax
                while (_nodeContextStack.TryPeek(out potentialArgumentNodeContext) &&
                       potentialArgumentNodeContext.SyntaxNode is ArgumentSyntax)
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

                if (_nodeContextStack.TryPeek(out var parameterExpressioNodeContext) && parameterExpressioNodeContext.SyntaxNode is IdentifierNameSyntax)
                {
                    nodeContext.AddComponentContext(parameterExpressioNodeContext);
                    _nodeContextStack.Pop();
                }

                nodeContext.Expression = Expression.Parameter(
                    nodeContext.Symbol.GetClrType(nodeContext.Model),
                    nodeContext.Symbol.Name);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

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

                var argumentListContext = nodeContext.ComponentContexts
                    .Skip(1)
                    .FirstOrDefault();

                var argumentExpressions =
                    argumentListContext?.SyntaxNode is ArgumentListSyntax l
                        ? argumentListContext.ComponentContexts
                            .Select(c => c.Expression)
                            .ToArray()
                        : new Expression[] { };

                var instanceExpression = methodOrDelegateNodeContext.Expression;
                var methodInfo = methodOrDelegateNodeContext.GetMethodInfo();

                nodeContext.Expression = Expression.Call(instanceExpression, methodInfo, argumentExpressions);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");
                //TODO: Do we ever need to use Expression.Invoke()?

                _nodeContextStack.Push(nodeContext);
            }

            public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
            {
                base.VisitMemberAccessExpression(node);
                LogVisitation($"{_outputIndent}VisitMemberAccessExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!(nodeContext.Symbol is IPropertySymbol || nodeContext.Symbol is IFieldSymbol))
                    return; // Only properties and fields are considered for MemberAccess as far as linq expressions is concerned

                if (!_nodeContextStack.TryPop(out var memberNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(memberNodeContext)} found for {nameof(MemberAccessExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var containingNodeContext))
                    throw new InvalidOperationException(
                        $"No {nameof(containingNodeContext)} found for {nameof(MemberAccessExpressionSyntax)} {node}");


                //if (!_nodeContextStack.TryPeek(out var containingNodeContext) &&
                //    containingNodeContext.Symbol is IParameterSymbol)
                //{
                //    _nodeContextStack.Pop();
                //    nodeContext.AddComponentContext(containingNodeContext);
                //}
                //else
                //{
                //    containingNodeContext = null;

                //}

                nodeContext.AddComponentContext(containingNodeContext);
                nodeContext.AddComponentContext(memberNodeContext);

                _nodeContextStack.Push(nodeContext);

                var memberInfo = memberNodeContext.GetMemberInfo();

                nodeContext.Expression = Expression.MakeMemberAccess(containingNodeContext.Expression, memberInfo);

                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");
            }



            public override void VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
            {
                base.VisitSimpleLambdaExpression(node);
                LogVisitation($"{_outputIndent}VisitSimpleLambdaExpression: {node}");

                var nodeContext = _nodeContexts[node];

                if (!_nodeContextStack.TryPop(out var lambdaBodyContext))
                    throw new InvalidOperationException(
                        $"No {nameof(lambdaBodyContext)} found for {nameof(SimpleLambdaExpressionSyntax)} {node}");

                if (!_nodeContextStack.TryPop(out var parameterContext))
                    throw new InvalidOperationException(
                        $"No {nameof(parameterContext)} found for {nameof(SimpleLambdaExpressionSyntax)} {node}");

                nodeContext.AddComponentContext(parameterContext);
                nodeContext.AddComponentContext(lambdaBodyContext);

                var parameterExpressions = parameterContext?.SyntaxNode switch
                {
                    ParameterListSyntax s => s.Parameters
                        .Select(p => Expression.Parameter(_nodeContexts[p].Type, _nodeContexts[p].Symbol.Name)).ToArray(),
                    ParameterSyntax s => new[] {Expression.Parameter(parameterContext.Type, _nodeContexts[s].Symbol.Name) },
                    _ => new ParameterExpression[] { }
                };

                nodeContext.Expression = Expression.Lambda(lambdaBodyContext.Expression, false, parameterExpressions);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

                _nodeContextStack.Push(nodeContext);
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

                var bodyExpression = lambdaBodyContext.Expression;

                argumentListContext = nodeContext.ComponentContexts
                    .Skip(1)
                    .FirstOrDefault();

                var parameterExpressions =
                    argumentListContext?.SyntaxNode is ArgumentListSyntax
                        ? argumentListContext.ComponentContexts
                            .Select(c => Expression.Parameter(c.Type, c.SyntaxNode.GetName()))
                            .ToArray()
                        : new ParameterExpression[] { };

                nodeContext.Expression = Expression.Lambda(bodyExpression, false, parameterExpressions);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

                _nodeContextStack.Push(nodeContext);
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

                var expressionType = GetOpExpressionType(node.Kind());

                

                nodeContext.Expression = Expression.MakeBinary(expressionType, leftNodeContext.Expression,
                    rightNodeContext.Expression);
            }

            public override void VisitIdentifierName(IdentifierNameSyntax node)
            {
                base.VisitIdentifierName(node);
                LogVisitation($"{_outputIndent}VisitIdentifierName: {node}");

                var nodeContext = _nodeContexts[node];

                switch (nodeContext.Symbol)
                {
                    case ILocalSymbol s:
                        nodeContext.Expression = Expression.Parameter(
                            s.GetClrType(nodeContext.Model),
                            s.Name);
                        break;
                    case IParameterSymbol s:
                        nodeContext.Expression = Expression.Parameter(
                            s.GetClrType(nodeContext.Model),
                            s.Name);
                        break;
                    case IPropertySymbol s:
                        if (s.IsStatic)
                        {
                            nodeContext.Expression = Expression.Property(null,
                                s.ContainingType.GetClrType(nodeContext.Model).GetProperty(s.Name,
                                    BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static));
                        }
                        else
                        {
                            if (!_nodeContextStack.TryPeek(out var containingNodeContext))
                                throw new InvalidOperationException("No nodeContext found for containing expression");

                            nodeContext.Expression = Expression.Property(containingNodeContext?.Expression, s.Name);
                            nodeContext.ComponentContexts.Push(containingNodeContext);
                        }


                        break;
                    case IFieldSymbol s:
                        if (s.IsStatic)
                        {
                            nodeContext.Expression = Expression.Field(null,
                                s.ContainingType.GetClrType(nodeContext.Model).GetField(s.Name,
                                    BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static));
                        }
                        else
                        {
                            if (!_nodeContextStack.TryPeek(out var containingNodeContext))
                                throw new InvalidOperationException("No nodeContext found for containing expression");

                            nodeContext.Expression = Expression.Field(containingNodeContext?.Expression, s.Name);
                            nodeContext.ComponentContexts.Push(containingNodeContext);
                        }

                        break;
                }
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

                _nodeContextStack.Push(nodeContext);
            }

            public override void VisitLiteralExpression(LiteralExpressionSyntax node)
            {
                base.VisitLiteralExpression(node);
                LogVisitation($"{_outputIndent}VisitLiteralExpression: {node}");

                var nodeContext = _nodeContexts[node];

                nodeContext.Expression = Expression.Constant(node.Token.Value);
                LogVisitation($"{_outputIndent}Build Expression: {nodeContext.Expression}");

                _nodeContextStack.Push(nodeContext);
            }
#nullable disable

 
            private static ExpressionType GetOpExpressionType(SyntaxKind kind)
            {
                return kind switch
                {
                    SyntaxKind.AddExpression => ExpressionType.Add,
                    SyntaxKind.SubtractExpression => ExpressionType.Subtract,
                    SyntaxKind.MultiplyExpression=> ExpressionType.Multiply,
                    SyntaxKind.DivideExpression=> ExpressionType.Divide,
                    SyntaxKind.ModuloExpression => ExpressionType.Modulo,
                    SyntaxKind.ExclusiveOrExpression => ExpressionType.ExclusiveOr,
                    SyntaxKind.BitwiseAndExpression => ExpressionType.And,
                    SyntaxKind.BitwiseOrExpression => ExpressionType.Or,
                    SyntaxKind.LogicalAndExpression => ExpressionType.AndAlso,
                    SyntaxKind.LogicalOrExpression => ExpressionType.OrElse,
                    SyntaxKind.SimpleAssignmentExpression => ExpressionType.Assign,
                    SyntaxKind.LeftShiftExpression => ExpressionType.LeftShift,
                    SyntaxKind.RightShiftExpression => ExpressionType.RightShift,
                    SyntaxKind.EqualsExpression => ExpressionType.Equal,
                    SyntaxKind.NotEqualsExpression => ExpressionType.NotEqual,
                    SyntaxKind.GreaterThanExpression => ExpressionType.GreaterThan,
                    SyntaxKind.LessThanExpression => ExpressionType.LessThan,
                    SyntaxKind.GreaterThanOrEqualExpression => ExpressionType.GreaterThanOrEqual,
                    SyntaxKind.LessThanOrEqualExpression => ExpressionType.LessThanOrEqual,
                    SyntaxKind.MultiplyAssignmentExpression => ExpressionType.MultiplyAssign,
                    SyntaxKind.SubtractAssignmentExpression => ExpressionType.SubtractAssign,
                    SyntaxKind.ExclusiveOrAssignmentExpression => ExpressionType.ExclusiveOrAssign,
                    SyntaxKind.LeftShiftAssignmentExpression => ExpressionType.LeftShiftAssign,
                    SyntaxKind.ModuloAssignmentExpression => ExpressionType.ModuloAssign,
                    SyntaxKind.AddAssignmentExpression => ExpressionType.AddAssign,
                    SyntaxKind.AndAssignmentExpression => ExpressionType.AndAssign,
                    SyntaxKind.OrAssignmentExpression => ExpressionType.OrAssign,
                    SyntaxKind.DivideAssignmentExpression => ExpressionType.DivideAssign,
                    SyntaxKind.PostDecrementExpression => ExpressionType.PostDecrementAssign,
                    SyntaxKind.PreDecrementExpression => ExpressionType.PreDecrementAssign,
                    SyntaxKind.PostIncrementExpression => ExpressionType.PostIncrementAssign,
                    SyntaxKind.PreIncrementExpression => ExpressionType.PreIncrementAssign,
                    SyntaxKind.UnaryMinusExpression => ExpressionType.Negate,
                    SyntaxKind.UnaryPlusExpression => ExpressionType.UnaryPlus,
                    _ => throw new NotSupportedException()

                };
            }

        }
    }

    public interface IEfQueryableBuilder<in T>
        where T: DbContext
    {
        public IQueryable GetQueryable(T dbContext, QueryableExpressionContext context);
    }
}
