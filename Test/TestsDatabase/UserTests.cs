using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Keas.Core.Domain;
using Shouldly;
using Test.Helpers;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTests")]
    public class UserTests
    {
        //TODO Actual tests like this:
        //[Fact]
        //public void OrdersCanBeWrittenToDatabaseWithExistingUser()
        //{
        //    using (var contextHelper = new ContextHelper())
        //    {

        //        contextHelper.Context.Orders.Count().ShouldBe(0);

        //        contextHelper.Context.Users.Add(CreateValidEntities.User(5));
        //        contextHelper.Context.SaveChanges();

        //        var order = CreateValidEntities.Order(1);
        //        order.Creator = contextHelper.Context.Users.FirstOrDefault();
        //        contextHelper.Context.Orders.Add(order);
        //        contextHelper.Context.SaveChanges();

        //        var updatedOrders = contextHelper.Context.Orders.Include(a => a.Creator).ToList();
        //        contextHelper.Context.Users.Count().ShouldBe(1);
        //        updatedOrders.Count().ShouldBe(1);


        //        updatedOrders[0].Creator.FirstName.ShouldBe("FirstName5");
        //    }
        //}

        #region Reflection of Database

        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Email", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.EmailAddressAttribute()]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)256)]"
            }));
            expectedFields.Add(new NameAndType("FirstName", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"First Name\")]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)50)]",
                
            }));
            expectedFields.Add(new NameAndType("Iam", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Id", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]",
            }));

            expectedFields.Add(new NameAndType("LastName", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"Last Name\")]",
                "[System.ComponentModel.DataAnnotations.RequiredAttribute()]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)50)]"
            }));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.DisplayAttribute(Name = \"Name\")]",
                "[System.ComponentModel.DataAnnotations.StringLengthAttribute((Int32)256)]"
            }));
            expectedFields.Add(new NameAndType("People", "System.Collections.Generic.List`1[Keas.Core.Domain.Person]", new List<string>()));
            expectedFields.Add(new NameAndType("TeamPermissions", "System.Collections.Generic.List`1[Keas.Core.Domain.TeamPermission]", new List<string>()));


            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(User));
        }

        #endregion Reflection of Database
    }
}
