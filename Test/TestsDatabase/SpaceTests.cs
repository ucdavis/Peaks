using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class SpaceTests
    {
        #region Reflection of Database

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
         
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Space));
        }

        #endregion Reflection of Database
    }
}
