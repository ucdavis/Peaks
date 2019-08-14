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
    public class EquipmentTests
    {
        private readonly ITestOutputHelper _output;

        public EquipmentTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Equipment));
            // Act
            // Assert	
            classReflection.ControllerInherits("AssetBase"); 
            classReflection.ClassExpectedNoAttribute();
        }

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Active", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Assignment", "Keas.Core.Domain.EquipmentAssignment", new List<string>()));
            expectedFields.Add(new NameAndType("Attributes", "System.Collections.Generic.List`1[Keas.Core.Domain.EquipmentAttribute]", new List<string>()));
            expectedFields.Add(new NameAndType("AvailabilityLevel", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)2)]",
            }));
            expectedFields.Add(new NameAndType("BigfixId", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)16)]",
            }));
            expectedFields.Add(new NameAndType("EquipmentAssignmentId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Make", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Model", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)64)]",
            }));
            expectedFields.Add(new NameAndType("Notes", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("ProtectionLevel", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)2)]",
            }));
            expectedFields.Add(new NameAndType("SerialNumber", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Space", "Keas.Core.Domain.Space", new List<string>()));
            expectedFields.Add(new NameAndType("SpaceId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Tags", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Team", "Keas.Core.Domain.Team", new List<string>()));
            expectedFields.Add(new NameAndType("TeamId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Title", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Type", "System.String", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Equipment));
        }

        #endregion Reflection of Database
    }
}
