using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class PersonTests
    {
        private readonly ITestOutputHelper _output;

        public PersonTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Person));
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
            expectedFields.Add(new NameAndType("AccessAssignments", "System.Collections.Generic.List`1[Keas.Core.Domain.AccessAssignment]", new List<string>()));
            expectedFields.Add(new NameAndType("Active", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Email", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.EmailAddressAttribute()]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)256)]",
            }));
            expectedFields.Add(new NameAndType("FirstName", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"First Name\")]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)50)]",
            }));
            expectedFields.Add(new NameAndType("Group", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("HomePhone", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerialAssignments", "System.Collections.Generic.List`1[Keas.Core.Domain.KeySerialAssignment]", new List<string>()));
            expectedFields.Add(new NameAndType("LastName", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"Last Name\")]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)50)]",
            }));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"Name\")]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)256)]",
            }));
            expectedFields.Add(new NameAndType("Tags", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Team", "Keas.Core.Domain.Team", new List<string>()));
            expectedFields.Add(new NameAndType("TeamId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("TeamPhone", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Title", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("User", "Keas.Core.Domain.User", new List<string>()));
            expectedFields.Add(new NameAndType("UserId", "System.String", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Person));
        }

        #endregion Reflection of Database
    }
}
