using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.CodeAnalysis;

namespace EfTestHelpers
{
    public class SymbolNodePair
    {
        public ISymbol Symbol { get; internal set; }
        public SyntaxNode SyntaxNode { get; internal set; }
    }
}
