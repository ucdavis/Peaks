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
    public class HistoryTests
    {
        private readonly ITestOutputHelper _output;

        public HistoryTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(History));
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
            expectedFields.Add(new NameAndType("Access", "Keas.Core.Domain.Access", new List<string>()));
            expectedFields.Add(new NameAndType("AccessId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("ActedDate", "System.DateTime", new List<string>()));
            expectedFields.Add(new NameAndType("ActionType", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Actor", "Keas.Core.Domain.User", new List<string>()));
            expectedFields.Add(new NameAndType("ActorId", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("AssetType", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Description", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
            }));

            expectedFields.Add(new NameAndType("Document", "Keas.Core.Domain.Document", new List<string>()));
            expectedFields.Add(new NameAndType("DocumentId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Equipment", "Keas.Core.Domain.Equipment", new List<string>()));
            expectedFields.Add(new NameAndType("EquipmentId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>()));
            expectedFields.Add(new NameAndType("Key", "Keas.Core.Domain.Key", new List<string>()));
            expectedFields.Add(new NameAndType("KeyId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerial", "Keas.Core.Domain.KeySerial", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerialId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Link", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.Schema.NotMappedAttribute()]",
            }));
            expectedFields.Add(new NameAndType("Target", "Keas.Core.Domain.Person", new List<string>()));
            expectedFields.Add(new NameAndType("TargetId", "System.Nullable`1[System.Int32]", new List<string>()));
            expectedFields.Add(new NameAndType("Workstation", "Keas.Core.Domain.Workstation", new List<string>()));
            expectedFields.Add(new NameAndType("WorkstationId", "System.Nullable`1[System.Int32]", new List<string>()));
            
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(History));
        }

        #endregion Reflection of Database
    }
}
