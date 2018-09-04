using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class EquipmentAttributeTests
    {
        #region Reflection of Database

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Equipment", "Keas.Core.Domain.Equipment", new List<string>()));
            expectedFields.Add(new NameAndType("EquipmentId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Key", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Value", "System.String", new List<string>()));
          
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(EquipmentAttribute));
        }

        #endregion Reflection of Database
    }
}
