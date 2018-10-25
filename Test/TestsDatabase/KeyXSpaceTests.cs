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
    public class KeyXSpaceTests
    {
        private readonly ITestOutputHelper _output;

        public KeyXSpaceTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(KeyXSpace));
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
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Key", "Keas.Core.Domain.Key", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
            }));
            expectedFields.Add(new NameAndType("KeyId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Space", "Keas.Core.Domain.Space", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
            }));

            expectedFields.Add(new NameAndType("SpaceId", "System.Nullable`1[System.Int32]", new List<string>()));

            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(KeyXSpace));
        }

        #endregion Reflection of Database
    }
}
