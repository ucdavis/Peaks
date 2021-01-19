using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace Test.TestsDatabase
{
    [Trait("Category", "DatabaseTests")]
    public class GroupTests
    {
        private readonly ITestOutputHelper _output;

        public GroupTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Group));
            // Act
            // Assert	
            classReflection.ControllerInherits("Object");
            classReflection.ClassExpectedNoAttribute();
        }

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("GroupPermissions", "System.Collections.Generic.List`1[Keas.Core.Domain.GroupPermission]", new List<string>
            {
                "[Newtonsoft.Json.JsonIgnoreAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"Group Name\")]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)128)]",
            }));
            expectedFields.Add(new NameAndType("Teams", "System.Collections.Generic.List`1[Keas.Core.Domain.GroupXTeam]", new List<string>
            {
                "[Newtonsoft.Json.JsonIgnoreAttribute()]",
            }));

            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Group));
        }

        #endregion Reflection of Database

    }
}

