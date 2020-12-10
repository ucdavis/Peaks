using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Reflection.Metadata;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
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
        private T _dbContext;

        public QueryableBuilder(QueryableScannerOptions options)
        {
            _options = options;
        }

        public IQueryable GetQueryable(T dbContext, QueryableExpressionContext context)
        {
            _context = context;
            _dbContext = dbContext;

            var rootNodeContext = GenerateQueryable(context);

            return rootNodeContext.Queryable;
        }

        /// <summary>
        /// Convert expression syntax to a <see cref="Func&lt;T, IQueryable&gt;"/>
        /// </summary>
        private SyntaxNodeContext GenerateQueryable(QueryableExpressionContext context)
        {
            _options.OutputWriteLine($"ORIGINAL EXPRESSION:{Environment.NewLine}{context.ExtensionMethodInvocation}");

            var nodeContexts = new Dictionary<SyntaxNode, SyntaxNodeContext>();

            foreach (var node in context.ExtensionMethodInvocation.DescendantNodesAndSelf())
            {
                nodeContexts.Add(node, new SyntaxNodeContext(node, _context, nodeContexts));
            }

            var model = context.ExtensionMethodInvocation.GetModel(_context.Solution);

            var rootNodeContext = nodeContexts[context.ExtensionMethodInvocation];



            var walker = new Walker(_options, _context, nodeContexts, _dbContext);
            walker.Visit(context.ExtensionMethodInvocation);

            return rootNodeContext;

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

        /// <summary>
        /// Organizes a collection of <see cref="SyntaxNodeContext"/>s into a tree that is more readily digestible
        /// for creation of Linq expression
        /// </summary>
        private class Walker : CSharpSyntaxWalker
        {
            private QueryableExpressionContext _context;
            private string _outputIndent = "";

            private readonly QueryableScannerOptions _options;
            private readonly Dictionary<SyntaxNode, SyntaxNodeContext> _nodeContexts;
            private T _dbContext;
            private HashSet<Type> _entityTypes;

            public Walker(QueryableScannerOptions options, QueryableExpressionContext context,
                Dictionary<SyntaxNode, SyntaxNodeContext> nodeContexts, T dbContext)
            {
                _options = options;
                _context = context;
                _nodeContexts = nodeContexts;
                _dbContext = dbContext;
                _entityTypes = _dbContext.GetType().GetProperties()
                    .Where(p => p.PropertyType.ImplementsOrDerives(typeof(DbSet<>)))
                    .Select(p => p.PropertyType.GenericTypeArguments[0])
                    .ToHashSet();
            }

            private void LogVisitation(string s)
            {
                _options.OutputWriteLine(s);
            }

#nullable enable

            public override void Visit(SyntaxNode node)
            {
                _outputIndent = _outputIndent + "    ";
                base.Visit(node);
                _outputIndent = _outputIndent.Substring(0, _outputIndent.Length - 4);
            }

            public override void VisitDefaultExpression(DefaultExpressionSyntax node)
            {
                base.VisitDefaultExpression(node);
                LogVisitation($"{_outputIndent}VisitDefaultExpression: {node}");

                var nodeContext = _nodeContexts[node];
                nodeContext.Expression = Expression.Default(nodeContext.Type);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitParameter(ParameterSyntax node)
            {
                base.VisitParameter(node);
                LogVisitation($"{_outputIndent}VisitParameter: {node}");

                var nodeContext = _nodeContexts[node];

                nodeContext.Expression = Expression.Parameter(
                    nodeContext.Symbol.GetClrType(nodeContext.Model),
                    nodeContext.Symbol.Name);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitInvocationExpression(InvocationExpressionSyntax node)
            {
                base.VisitInvocationExpression(node);
                LogVisitation($"{_outputIndent}VisitInvocationExpression: {node}");

                var nodeContext = _nodeContexts[node];
                var methodOrDelegateNodeContext = _nodeContexts[node.Expression];

                if (methodOrDelegateNodeContext.Symbol.Name == "AsQueryable" && methodOrDelegateNodeContext.Queryable != null)
                {
                    nodeContext.Queryable = methodOrDelegateNodeContext.Queryable;
                    LogVisitation($"{_outputIndent}* Pass Queryable Up: {nodeContext.Queryable}");
                    return;
                }

                var (methodInfo, arguments) = nodeContext.GetMethodAndArguments();

                if (methodOrDelegateNodeContext.Queryable != null)
                {
                    if (methodInfo.ReturnType?.ImplementsOrDerives(typeof(IQueryable<>)) ?? false)
                    {
                        nodeContext.Queryable = (IQueryable) methodInfo.Invoke(null, arguments);
                        LogVisitation($"{_outputIndent}* Get Queryable from invocation: {nodeContext.Queryable}");
                        return;
                    }

                    if (methodInfo.ReturnType?.ImplementsOrDerives(typeof(Task<>)) ?? false)
                    {
                        var queryable = methodOrDelegateNodeContext.Queryable;

                        var predicateExpression = arguments
                            .Where(a => a is LambdaExpression lambda && lambda.ReturnType == typeof(bool))
                            .Cast<Expression>()
                            .FirstOrDefault();

                        if (predicateExpression != null)
                        {
                            // for those extension methods that take a predicate, combine the predicate via Where()

                            // Get the Where method that takes an Expression<Func<TSource, bool>>
                            var whereMethodinfo = typeof(Queryable).GetMethods().First(m =>
                                    m.Name == "Where"
                                    && m.GetParameters()[1]
                                        .ParameterType.GetGenericArguments()[0]
                                        .GetMethod("Invoke")
                                        .GetParameters().Length == 1)
                                .MakeGenericMethod(queryable.ElementType);

                            queryable = (IQueryable) whereMethodinfo.Invoke(null,
                                new object[] {queryable, predicateExpression});
                        }

                        nodeContext.Queryable = queryable;
                        LogVisitation($"{_outputIndent}* Get Queryable from invocation after combining with extra predicate: {nodeContext.Queryable}");
                        return;
                    }
                }


                var instanceExpression = methodOrDelegateNodeContext.Expression;

                var argumentExpressions = arguments.Cast<Expression>().ToArray();

                nodeContext.Expression = Expression.Call(instanceExpression, methodInfo, argumentExpressions);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
            {
                base.VisitMemberAccessExpression(node);
                LogVisitation($"{_outputIndent}VisitMemberAccessExpression: {node}");

                var nodeContext = _nodeContexts[node];
                var containingNodeContext = _nodeContexts[node.Expression];
                var memberNodeContext = _nodeContexts[node.Name];

                var queryable = containingNodeContext.Queryable ?? memberNodeContext.Queryable;

                if (queryable != null )
                {
                    if (node.Name.ToString() == "AsQueryable" && queryable.GetType().ImplementsOrDerives(typeof(DbSet<>)))
                    {
                        queryable = (IQueryable)queryable.GetType().GetMethod("AsQueryable").Invoke(queryable, new object[] { });
                    }
                    nodeContext.Queryable = queryable;
                    LogVisitation($"{_outputIndent}* Pass Queryable Up: {nodeContext.Queryable}");
                    return;
                }

                if (!(nodeContext.Symbol is IPropertySymbol || nodeContext.Symbol is IFieldSymbol))
                    return; // Only properties and fields are considered for MemberAccess as far as linq expressions is concerned


                var memberInfo = memberNodeContext.GetMemberInfo();

                nodeContext.Expression = Expression.MakeMemberAccess(containingNodeContext.Expression, memberInfo);

                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }



            public override void VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
            {
                base.VisitSimpleLambdaExpression(node);
                LogVisitation($"{_outputIndent}VisitSimpleLambdaExpression: {node}");

                var nodeContext = _nodeContexts[node];
                var parameterContext = _nodeContexts[node.Parameter];
                var lambdaBodyContext = _nodeContexts[node.Body];

                var paramList = new[] {Expression.Parameter(parameterContext.Type, _nodeContexts[node.Parameter].Symbol.Name)};

                nodeContext.Expression = Expression.Lambda(lambdaBodyContext.Expression, false, paramList);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
            {
                base.VisitParenthesizedLambdaExpression(node);
                LogVisitation($"{_outputIndent}VisitParenthesizedLambdaExpression: {node}");

                var nodeContext = _nodeContexts[node];
                var lambdaBodyContext = _nodeContexts[node.Body];

                var paramList = node.ParameterList.Parameters
                    .Select(p => Expression.Parameter(_nodeContexts[p].Type, _nodeContexts[p].Symbol.Name)).ToList();

                nodeContext.Expression = Expression.Lambda(lambdaBodyContext.Expression, false, paramList);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitBinaryExpression(BinaryExpressionSyntax node)
            {
                base.VisitBinaryExpression(node);
                LogVisitation($"{_outputIndent}VisitBinaryExpression: {node}");

                var nodeContext = _nodeContexts[node];
                var leftNodeContext = _nodeContexts[node.Left];
                var rightNodeContext = _nodeContexts[node.Right];

                var expressionType = GetOpExpressionType(node.Kind());

                nodeContext.Expression = Expression.MakeBinary(expressionType, leftNodeContext.Expression,
                    rightNodeContext.Expression);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitIdentifierName(IdentifierNameSyntax node)
            {
                base.VisitIdentifierName(node);
                LogVisitation($"{_outputIndent}VisitIdentifierName: {node}");

                var nodeContext = _nodeContexts[node];

                if (nodeContext.Symbol is IMethodSymbol)
                {
                    LogVisitation($"{_outputIndent}* Ignore method identifier");
                    return;
                }

                var type = nodeContext.Symbol.GetClrType(nodeContext.Model);

                if (type.ImplementsOrDerives(typeof(T)))
                {
                    LogVisitation($"{_outputIndent}* Ignore dbContext identifier");
                    return;
                }

                if (type.ImplementsOrDerives(typeof(DbSet<>)))
                {
                    nodeContext.Queryable =
                        (IQueryable) typeof(T).GetProperty(node.Identifier.Text).GetMethod
                            .Invoke(_dbContext, new object[] { });
                    LogVisitation($"{_outputIndent}* Set Queryable: {nodeContext.Queryable}");
                    return;
                }

                if (type.ImplementsOrDerives(typeof(IQueryable<>)))
                {
                    throw new InvalidOperationException("Not yet sure what to do here");
                }

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
                            //node.Identifier.
                            //nodeContext.Expression = Expression.Property(containingNodeContext?.Expression, s.Name);
                            //nodeContext.ComponentContexts.Push(containingNodeContext);
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
                            //if (_nodeContextStack.TryPeek(out var containingNodeContext))
                            //{
                            //    nodeContext.Expression = Expression.Field(containingNodeContext?.Expression, s.Name);
                            //    nodeContext.ComponentContexts.Push(containingNodeContext);
                            //}
                            //else if (typeof(DbContext).IsAssignableFrom(nodeContext.Type))
                            //{
                            //    nodeContext.Expression = Expression.Parameter(nodeContext.Type, "dbContext");
                            //}
                            //else
                            //{
                            //    throw new InvalidOperationException("No nodeContext found for containing expression");
                            //}


                        }

                        break;
                }
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
            }

            public override void VisitLiteralExpression(LiteralExpressionSyntax node)
            {
                base.VisitLiteralExpression(node);
                LogVisitation($"{_outputIndent}VisitLiteralExpression: {node}");

                var nodeContext = _nodeContexts[node];

                nodeContext.Expression = Expression.Constant(node.Token.Value);
                LogVisitation($"{_outputIndent}* Build Expression: {nodeContext.Expression}");
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
