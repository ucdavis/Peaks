using Keas.Core.Domain;
using Shouldly;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using TestHelpers.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace Test.TestsDatabase
{
    [Trait("Category", "DatabaseTests")]
    public class SpaceTests
    {
        private readonly ITestOutputHelper _output;

        public SpaceTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Space));
            // Act
            // Assert	
            classReflection.ControllerInherits("Object"); //Doesn't inherit from another domain object
            classReflection.ClassExpectedNoAttribute();
        }


        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Active", "System.Boolean", new List<string>()));

            expectedFields.Add(new NameAndType("BldgKey", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("BldgName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("ChartNum", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("DeptKey", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("DeptName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("FloorKey", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("FloorName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("OrgId", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("RoomCategoryCode", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("RoomCategoryName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("RoomKey", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("RoomName", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("RoomNumber", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Source", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("SqFt", "System.Nullable`1[System.Int32]", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Space));
        }

        #endregion Reflection of Database
    }
}
