using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using Keas.Core.Domain;
using Shouldly;
using TestHelpers.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class ExtendedPersonViewsTests
    {
        private readonly ITestOutputHelper _output;

        public ExtendedPersonViewsTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(ExtendedPersonView));
            // Act
            // Assert	
            classReflection.ControllerInherits("Object"); 
            var attribute1 = classReflection.ClassExpectedAttribute<TableAttribute>(showListOfAttributes: true, totalAttributeCount:2);
            attribute1.ElementAt(0).Name.ShouldBe("vExtendedPersonViews");
            var attribute2 = classReflection.ClassExpectedAttribute<ReadOnlyAttribute>(showListOfAttributes: true, totalAttributeCount: 2);
            attribute2.ElementAt(0).IsReadOnly.ShouldBe(true);
        }

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Category", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Email", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("EndDate", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("FirstName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("LastAddDate", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("LastName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("S_Email", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("S_FirstName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("S_LastName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Slug", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("StartDate", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("SupervisorId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Tags", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("UserId", "System.String", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(ExtendedPersonView));
        }

        #endregion Reflection of Database
    }
}
