using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class EquipmentAssignmentTests
    {
        #region Reflection of Database

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("ApprovedAt", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("ConfirmedAt", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("ExpiresAt", "System.DateTime", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("IsConfirmed", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Person", "Keas.Core.Domain.Person", new List<string>()));
            expectedFields.Add(new NameAndType("PersonId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("RequestedAt", "System.DateTime", new List<string>()));
            expectedFields.Add(new NameAndType("RequestedBy", "Keas.Core.Domain.User", new List<string>()));
            expectedFields.Add(new NameAndType("RequestedByName", "System.String", new List<string>()));

            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(EquipmentAssignment));
        }

        #endregion Reflection of Database
    }
}
