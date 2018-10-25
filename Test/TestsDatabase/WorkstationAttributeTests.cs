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
    public class WorkstationAttributeTests
    {
        private readonly ITestOutputHelper _output;

        public WorkstationAttributeTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(WorkstationAttribute));
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
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Key", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Value", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Workstation", "Keas.Core.Domain.Workstation", new List<string>()));
            expectedFields.Add(new NameAndType("WorkstationId", "System.Int32", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(WorkstationAttribute));
        }

        #endregion Reflection of Database
    }
}
