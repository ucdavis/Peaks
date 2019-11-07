using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using Keas.Core.Models;
using Keas.Mvc.Controllers.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shouldly;
using Xunit;
using Xunit.Abstractions;
namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class ApiAccessControllerTests
    {
        //TODO
    }

    [Trait("Category", "ControllerTests")]
    public class ApiAccessControllerReflectionTests
    {
        private readonly ITestOutputHelper output;
        protected readonly Type ControllerClass = typeof(AccessController);

        public ApiAccessControllerReflectionTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        #region Controller Class Tests
        [Fact]
        public void TestControllerInheritsFromApplicationController()
        {
            #region Arrange
            var controllerClass = ControllerClass.GetTypeInfo();
            #endregion Arrange

            #region Act
            controllerClass.BaseType.ShouldNotBe(null);
            var result = controllerClass.BaseType.Name;
            #endregion Act

            #region Assert
            result.ShouldBe("SuperController");

            #endregion Assert
        }

        [Fact]
        public void TestControllerExpectedNumberOfAttributes()
        {
            #region Arrange
            var controllerClass = ControllerClass.GetTypeInfo();
            #endregion Arrange

            #region Act
            var result = controllerClass.GetCustomAttributes(true);
            #endregion Act

            #region Assert
            foreach (var o in result)
            {
                output.WriteLine(o.ToString()); //Output shows 
            }
            result.Count().ShouldBe(4);

            #endregion Assert
        }

        /// <summary>
        /// #1
        /// </summary>
        [Fact]
        public void TestControllerHasControllerAttribute()
        {
            #region Arrange
            var controllerClass = ControllerClass.GetTypeInfo();
            #endregion Arrange

            #region Act
            var result = controllerClass.GetCustomAttributes(true).OfType<ControllerAttribute>();
            #endregion Act

            #region Assert
            result.Count().ShouldBeGreaterThan(0, "ControllerAttribute not found.");

            #endregion Assert
        }

        /// <summary>
        /// #2
        /// </summary>
        [Fact]
        public void TestControllerHasAuthorizeAttribute()
        {
            #region Arrange
            var controllerClass = ControllerClass.GetTypeInfo();
            #endregion Arrange

            #region Act
            var result = controllerClass.GetCustomAttributes(true).OfType<AuthorizeAttribute>();
            #endregion Act

            #region Assert
            result.Count().ShouldBeGreaterThan(0, "AuthorizeAttribute not found.");
            result.ElementAt(0).Roles.ShouldBe(null);
            result.ElementAt(0).Policy.ShouldBe(AccessCodes.Codes.AccessMasterAccess);
            #endregion Assert
        }

        /// <summary>
        /// #3
        /// </summary>
        [Fact]
        public void TestControllerHasAutoValidateAntiforgeryTokenAttribute()
        {
            #region Arrange
            var controllerClass = ControllerClass.GetTypeInfo();
            #endregion Arrange

            #region Act
            var result = controllerClass.GetCustomAttributes(true).OfType<AutoValidateAntiforgeryTokenAttribute>();
            #endregion Act

            #region Assert
            result.Count().ShouldBeGreaterThan(0, "AutoValidateAntiforgeryTokenAttribute not found.");

            #endregion Assert
        }
        #endregion Controller Class Tests
    }
}
