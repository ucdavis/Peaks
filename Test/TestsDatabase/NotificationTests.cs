using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class NotificationTests
    {
        #region Reflection of Database

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("DateTimeCreated", "System.DateTime", new List<string>()));
            expectedFields.Add(new NameAndType("DateTimeSent", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("Details", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("History", "Keas.Core.Domain.History", new List<string>()));
            expectedFields.Add(new NameAndType("HistoryId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("NeedsAccept", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Pending", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("User", "Keas.Core.Domain.User", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Notification));
        }

        #endregion Reflection of Database
    }
}
