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
    public class KeySerialTests
    {
        private readonly ITestOutputHelper _output;

        public KeySerialTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(KeySerial));
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
            expectedFields.Add(new NameAndType("Active", "System.Boolean", new List<string>()));
            
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Key", "Keas.Core.Domain.Key", new List<string>()));
           
            expectedFields.Add(new NameAndType("KeyId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerialAssignment", "Keas.Core.Domain.KeySerialAssignment", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerialAssignmentId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Number", "System.String", new List<string>()));     
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(KeySerial));
        }

        #endregion Reflection of Database
    }
}
