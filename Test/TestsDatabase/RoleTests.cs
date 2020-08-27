using System;
using System.Collections.Generic;
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
    public class RoleTests
    {

        private readonly ITestOutputHelper _output;

        public RoleTests(ITestOutputHelper output)
        {
            _output = output;
        }

        #region Reflection of Database

        [Fact]
        public void TestClassAttributes()
        {
            // Arrange
            var classReflection = new ControllerReflection(_output, typeof(Role));
            // Act
            // Assert	
            classReflection.ControllerInherits("Object"); 
            classReflection.ClassExpectedNoAttribute();
        }

        [Fact]
        public void TestCodesHaveExpectedValues()
        {
            var scType = typeof(Role.Codes);
            var props = scType.GetFields();
            props.Length.ShouldBe(8);

            //1
            Role.Codes.AccessMaster.ShouldBe("AccessMaster");
            //2
            Role.Codes.Admin.ShouldBe("Admin");
            //3
            Role.Codes.DepartmentalAdmin.ShouldBe("DepartmentalAdmin");
            //4
            Role.Codes.EquipmentMaster.ShouldBe("EquipMaster");
            //5
            Role.Codes.KeyMaster.ShouldBe("KeyMaster");
            //6
            Role.Codes.SpaceMaster.ShouldBe("SpaceMaster");
            //7
            Role.Codes.DocumentMaster.ShouldBe("DocumentMaster");
            //8
            Role.Codes.PersonManager.ShouldBe("PersonManager");
        }

        #endregion Codes Tests

        #region Reflection of Database

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Id", "System.Int32", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));
            expectedFields.Add(new NameAndType("IsAdmin", "System.Boolean", new List<string>()));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)50)]",
            }));
            
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Role));
        }

        #endregion Reflection of Database
    }
}
