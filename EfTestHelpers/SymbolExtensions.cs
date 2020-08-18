using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Reflection.Metadata;
using System.Text;
using Gu.Roslyn.AnalyzerExtensions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Extensions;


namespace EfTestHelpers
{
    public static class SymbolExtensions
    {
        public static SymbolNodePair GetSymbolNodePair(this ISymbol symbol, Solution solution)
        {
            return symbol.DeclaringSyntaxReferences[0]
                .GetSyntax()
                .GetSymbolNodePair(solution);
        }

        public static Type GetClrType(this ISymbol symbol)
        {
            Type clrType = null;
            switch (symbol)
            {
                case IFieldSymbol s:
                    clrType = s.Type.GetClrType();
                    return clrType;
                case ILocalSymbol s:
                    clrType = s.Type.GetClrType();
                    return clrType;
                case IPropertySymbol s:
                    clrType = s.Type.GetClrType();
                    return clrType;
                case IParameterSymbol s:
                    clrType = s.Type.GetClrType();
                    return clrType;
                default:
                    throw new NotSupportedException($"Unable to get name and type from symbol \"{symbol?.ToString() ?? "null"}\" of type \"{symbol?.Kind.ToString() ?? "unknown"}\"");
            }

        }

        // I can't believe it's this hard to get a System.Type from a Microsoft.CodeAnalysis.INamedTypeSymbol
        public static Type GetClrType(this ITypeSymbol symbol)
        {
            var typeSymbol = symbol as INamedTypeSymbol;

            if (typeSymbol == null)
            {
                throw  new ArgumentException($"Argument {nameof(symbol)} ({symbol.Kind}) is not a {nameof(INamedTypeSymbol)}");
            }

            if (typeSymbol.IsPrimitive())
                return Type.GetType($"{typeSymbol.ContainingNamespace}.{typeSymbol.Name}");

            var typeName = typeSymbol.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
            var assemblyQualifier = typeSymbol.ContainingAssembly.Identity.ToString();

            if (typeSymbol.IsGenericType)
            {
                var openTypeName = typeName.Substring(0, typeName.IndexOf("<")) +
                                   $"`{typeSymbol.TypeParameters.Length}";

                var openType = Type.GetType($"{openTypeName}, {assemblyQualifier}");

                if (openType == null)
                {
                    throw new InvalidOperationException($"Unable to resolve type \"{openTypeName}, {assemblyQualifier}\"");
                }

                var genericParameterTypes = typeSymbol.TypeArguments.Select(p => p.GetClrType()).ToArray();

                var closedType = openType.MakeGenericType(genericParameterTypes);

                return closedType;
            }

            if (typeSymbol.IsUnboundGenericType)
            {
                throw new InvalidOperationException($"Unable to resolve concrete/closed type for {nameof(symbol)} {typeSymbol}");
            }


            var resolvedType = Type.GetType($"{typeName}, {assemblyQualifier}");

            return resolvedType;
        }
    }
}
