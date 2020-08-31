using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Reflection.Metadata;
using System.Text;
using Gu.Roslyn.AnalyzerExtensions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;
using Microsoft.CodeAnalysis.CSharp.Syntax;


namespace EfTestHelpers
{
    internal static class MiscExtensions
    {
        public static string GetName(this SyntaxNode syntaxNode)
        {
            throw new InvalidOperationException();
        }

        public static object Instantiate(this Type type)
        {
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Byte:
                case TypeCode.SByte:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                case TypeCode.Decimal:
                case TypeCode.Double:
                case TypeCode.Single:
                    return 1;
                case TypeCode.Boolean:
                    return true;
                case TypeCode.Char:
                    return '-';
                case TypeCode.DateTime:
                    return DateTime.Now;
                case TypeCode.String:
                    return "Nothing";
            }

            if (type.IsEnum)
                return 0;

            if (type.ImplementsOrDerives(typeof(Guid)))
                return Guid.NewGuid();

            if (type.ImplementsOrDerives(typeof(IEnumerable<>)))
            {
                var array = Array.CreateInstance(type.GetElementType(), 1);
                array.SetValue(Instantiate(type.GetElementType()), 0);
                return array;
            }

            var nullableOfType = Nullable.GetUnderlyingType(type);
            if (nullableOfType != null)
                return Instantiate(nullableOfType);

            throw new InvalidOperationException($"Unable to initialize {nameof(type)} {type}");
        }

        public static bool ImplementsOrDerives(this Type type, Type otherType)
        {
            if (otherType is null)
            {
                return false;
            }

            if (!otherType.IsGenericType)
            {
                return otherType.IsAssignableFrom(type);
            }

            if (!otherType.IsGenericTypeDefinition)
            {
                return otherType.IsAssignableFrom(type);
            }

            if (otherType.IsInterface)
            {
                foreach (Type @interface in type.GetInterfaces())
                {
                    if (@interface.IsGenericType && @interface.GetGenericTypeDefinition() == otherType)
                    {
                        return true;
                    }
                }
            }

            if (type.IsGenericType && type.GetGenericTypeDefinition() == otherType)
            {
                return true;
            }

            return type.BaseType?.ImplementsOrDerives(otherType) ?? false;
        }

        private static readonly ConcurrentDictionary<SyntaxTree, SemanticModel> MapTreesToModels =
            new ConcurrentDictionary<SyntaxTree, SemanticModel>();

        // Workaround for scripting issue: https://github.com/dotnet/roslyn/issues/6101
        internal static unsafe MetadataReference GetScriptableMetadataReference(this Type type)
        {
            var assembly = type.GetTypeInfo().Assembly;
            if (!assembly.TryGetRawMetadata(out var b, out var length))
                throw new InvalidOperationException($"Unable to get raw metadata from assembly for type {type.AssemblyQualifiedName}");
            var moduleMetadata = ModuleMetadata.CreateFromMetadata((IntPtr)b, length);
            var assemblyMetadata = AssemblyMetadata.Create(moduleMetadata);
            var reference = assemblyMetadata.GetReference();
            return reference;
        }

        /// <summary>
        /// Get 1-based line number
        /// </summary>
        internal static int GetLineNumber(this SyntaxNode syntaxNode)
        {
            return syntaxNode.SyntaxTree.GetLineSpan(syntaxNode.Span).StartLinePosition.Line + 1;
        }

        internal static ISymbol GetSymbol(this SyntaxNode node, Solution solution)
        {
            var model = node.GetModel(solution);
            var info = ModelExtensions.GetSymbolInfo(model, node);
            return info.Symbol;
        }

        internal static T GetSymbol<T>(this SyntaxNode node, Solution solution)
            where T : ISymbol
        {
            return (T)node.GetSymbol(solution);
        }

        internal static SemanticModel GetModel(this SyntaxNode node, Solution solution)
        {
            return node.SyntaxTree.GetModel(solution);
        }

        internal static SemanticModel GetModel(this SyntaxTree tree, Solution solution)
        {
            if (solution == null)
            {
                throw new ArgumentNullException(nameof(solution));
            }

            return MapTreesToModels.GetOrAdd(tree,
                key => solution.GetDocument(tree).GetSemanticModelAsync().GetAwaiter().GetResult());
        }

        internal static ArgumentSyntax[] GetMappedArguments(this InvocationExpressionSyntax invocation, IParameterSymbol parameter, int parameterIndex)
        {
            var arguments = invocation.ArgumentList.Arguments;
            var namedArgument = arguments.SingleOrDefault(_ => _.NameColon?.Name.Identifier.ValueText == parameter.Name);
            if (namedArgument != null) return new[] {namedArgument};

            if (parameterIndex >= arguments.Count) return new ArgumentSyntax[0];
            if (parameter.IsParams)
            {
                var r = new ArgumentSyntax[arguments.Count - parameterIndex];
                for (var i = 0; i < r.Length; i++)
                    r[i] = arguments[i + parameterIndex];
                return r;
            }

            return new[] { arguments[parameterIndex] };
        }

        internal static IParameterSymbol GetMappedParameter(this IMethodSymbol method, ArgumentSyntax argument, int argumentIndex)
        {
            if (method.Parameters.Length == 0) return null;
            var name = argument.NameColon?.Name.Identifier.ValueText;
            if (name != null) return method.Parameters.SingleOrDefault(_ => _.Name == name);

            if (argumentIndex < method.Parameters.Length) return method.Parameters[argumentIndex];

            var last = method.Parameters[method.Parameters.Length - 1];
            return last.IsParams ? last : null;
        }


        internal static ITypeSymbol GetTypeSymbol(this ISymbol symbol)
        {
            switch (symbol)
            {
                case IFieldSymbol s:
                    return s.Type;
                case ILocalSymbol s:
                    return s.Type;
                case IPropertySymbol s:
                    return s.Type;
                case IParameterSymbol s:
                    return s.Type;
                default:
                    return null;
            }

        }

        internal static Type GetClrType(this ISymbol symbol, SemanticModel model)
        {
            Type clrType;
            switch (symbol)
            {
                case IFieldSymbol s:
                    clrType = s.Type.GetClrType(model);
                    return clrType;
                case ILocalSymbol s:
                    clrType = s.Type.GetClrType(model);
                    return clrType;
                case IPropertySymbol s:
                    clrType = s.Type.GetClrType(model);
                    return clrType;
                case IParameterSymbol s:
                    clrType = s.Type.GetClrType(model);
                    return clrType;
                case ITypeSymbol s:
                    return s.GetClrType(model);
                default:
                    return null;
            }

        }

        internal static Type GetClrType(this ITypeSymbol symbol, SemanticModel model)
        {
            switch (symbol)
            {
                case INamedTypeSymbol typeSymbol:
                    return typeSymbol.GetClrType(model);
                case IArrayTypeSymbol arrayTypeSymbol:
                    var elementType = arrayTypeSymbol.ElementType.GetClrType(model);
                    if (elementType == null)
                        throw  new InvalidOperationException($"Unable to get element clr type for IArrayTypeSymbol {arrayTypeSymbol}");
                    return Type.GetType($"{elementType.FullName}[]");
                default:
                    return null;
            }

        }

        // I can't believe it's this hard to get a System.Type from a Microsoft.CodeAnalysis.INamedTypeSymbol
        internal static Type GetClrType(this INamedTypeSymbol typeSymbol, SemanticModel model)
        {
            if (typeSymbol.IsPrimitive())
                return Type.GetType($"{typeSymbol.ContainingNamespace}.{typeSymbol.Name}");

            var typeName = typeSymbol.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
            var assemblyQualifier = typeSymbol.ContainingAssembly.Identity.ToString();

            if (typeSymbol.IsGenericType)
            {
                var index = typeName.IndexOf("<");

                if (index < 0)
                {
                    if (typeName.EndsWith("?"))
                        return Type.GetType(typeName);

                    throw new InvalidOperationException($"Unable to resolve type \"{typeName}, {assemblyQualifier}\"");
                }

                var openTypeName = typeName.Substring(0, index) +
                                   $"`{typeSymbol.TypeParameters.Length}";

                var openType = Type.GetType($"{openTypeName}, {assemblyQualifier}");

                if (openType == null)
                {
                    throw new InvalidOperationException($"Unable to resolve type \"{openTypeName}, {assemblyQualifier}\"");
                }

                var genericParameterTypes = typeSymbol.TypeArguments.Select(p => p.GetClrType(model)).ToArray();

                var closedType = openType.MakeGenericType(genericParameterTypes);

                return closedType;
            }

            if (typeSymbol.IsUnboundGenericType)
            {
                throw new InvalidOperationException(
                    $"Unable to resolve concrete/closed type for {nameof(typeSymbol)} {typeSymbol}");
            }


            var resolvedType = Type.GetType($"{typeName}, {assemblyQualifier}");

            return resolvedType;
        }
    }
}
