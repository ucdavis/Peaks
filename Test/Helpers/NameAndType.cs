using System;
using System.Collections.Generic;
using System.Text;

namespace Test.Helpers
{
    public class NameAndType
    {
        public NameAndType(string name, string property, List<string> attributes)
        {
            Name = name;
            Property = property;
            Attributes = attributes;
            ParameterAttributes = null;
        }
        public NameAndType(string name, string property, List<AttributeList> parameterAttributes)
        {
            Name = name;
            Property = property;
            Attributes = null;
            ParameterAttributes = parameterAttributes;
        }
        public string Name;
        public string Property;
        public List<string> Attributes;
        public List<AttributeList> ParameterAttributes;
    }
    public class AttributeList
    {
        public AttributeList(string attributeNameStartsWith, List<string> namedParameters)
        {
            AttributeNameStartsWith = attributeNameStartsWith;
            NamedParameters = namedParameters;
        }

        public string AttributeNameStartsWith;
        public List<string> NamedParameters;

    }
}
