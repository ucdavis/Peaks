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
    public class NotificationTests
    {
        private readonly ITestOutputHelper _output;

        public NotificationTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Notification));
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
            expectedFields.Add(new NameAndType("DateTimeCreated", "System.DateTime", new List<string>()));
            expectedFields.Add(new NameAndType("DateTimeSent", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("Details", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("History", "Keas.Core.Domain.History", new List<string>()));
            expectedFields.Add(new NameAndType("HistoryId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("NeedsAccept", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Pending", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Team", "Keas.Core.Domain.Team", new List<string>()));
            expectedFields.Add(new NameAndType("TeamId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("User", "Keas.Core.Domain.User", new List<string>()));
            expectedFields.Add(new NameAndType("UserId", "System.String", new List<string>()));
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Notification));
        }

        #endregion Reflection of Database
    }
}
