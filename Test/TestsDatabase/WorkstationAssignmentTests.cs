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
    public class WorkstationAssignmentTests
    {
        private readonly ITestOutputHelper _output;

        public WorkstationAssignmentTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(WorkstationAssignment));
            // Act
            // Assert	
            classReflection.ControllerInherits("AssignmentBase"); 
            classReflection.ClassExpectedNoAttribute();
        }

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("ApprovedAt", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("ConfirmedAt", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("ExpiresAt", "System.DateTime", new List<string> 
            {
                "[System.ComponentModel.DataAnnotations.DisplayFormatAttribute(DataFormatString = \"{0:d}\", ApplyFormatInEditMode = True)]",
            }));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("IsConfirmed", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("NextNotificationDate", "System.Nullable`1[System.DateTime]", new List<string>()));
            expectedFields.Add(new NameAndType("Person", "Keas.Core.Domain.Person", new List<string>()));
            expectedFields.Add(new NameAndType("PersonId", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("RequestedAt", "System.DateTime", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayFormatAttribute(DataFormatString = \"{0:d}\")]",
            }));
            expectedFields.Add(new NameAndType("RequestedBy", "Keas.Core.Domain.User", new List<string>()));
            expectedFields.Add(new NameAndType("RequestedByName", "System.String", new List<string>()));

            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(WorkstationAssignment));
        }

        #endregion Reflection of Database
    }
}
