using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Controllers.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shouldly;
using System.Linq;
using System.Runtime.CompilerServices;
using TestHelpers.Helpers;
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
        public ControllerReflection ControllerReflection;

        public ApiAccessControllerReflectionTests(ITestOutputHelper output)
        {
            this.output = output;
            ControllerReflection = new ControllerReflection(this.output, typeof(AccessController));
        }

        #region Controller Class Tests

        [Fact]
        public void TestControllerClassAttributes()
        {
            ControllerReflection.ControllerInherits("SuperController");
            var authAttribute = ControllerReflection.ClassExpectedAttribute<AuthorizeAttribute>(5);
            authAttribute.ElementAt(0).Roles.ShouldBe(null);
            authAttribute.ElementAt(0).Policy.ShouldBe(AccessCodes.Codes.AccessMasterAccess);
            ControllerReflection.ClassExpectedAttribute<AutoValidateAntiforgeryTokenOrApiAttribute>(5);
            ControllerReflection.ClassExpectedAttribute<ControllerAttribute>(5);
            ControllerReflection.ClassExpectedAttribute<ApiControllerAttribute>(5);
            
            var route = ControllerReflection.ClassExpectedAttribute<RouteAttribute>(5);
            route.ElementAt(0).Template.ShouldBe("api/{teamName}/access/[action]");
        }

        #endregion Controller Class Tests

        #region Controller Method Tests

        [Fact]
        public void TestControllerContainsExpectedNumberOfPublicMethods()
        {
            ControllerReflection.ControllerPublicMethods(10);
        }

        [Fact]
        public void TestControllerMethodAttributes()
        {

#if DEBUG
            var countAdjustment = 1;
#else
            var countAdjustment = 0;
#endif

            //1
            var apiVal = ControllerReflection.MethodExpectedAttribute<ApiExplorerSettingsAttribute>("GetTeam", 1, "GetTeam-1", showListOfAttributes:false);
            apiVal.ElementAt(0).IgnoreApi.ShouldBeTrue();
            //2
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Search", 2 + countAdjustment, "Search", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Search", 2 + countAdjustment, "Search", showListOfAttributes: false);
            //3
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("ListAssigned", 2 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("ListAssigned", 2 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            //4
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("List", 2 + countAdjustment, "List", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("List", 2 + countAdjustment, "List", showListOfAttributes: false);
            //5
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Details", 2 + countAdjustment, "Details", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Details", 2 + countAdjustment, "Details", showListOfAttributes: false);
            //6
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Create", 2 + countAdjustment, "Create", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Create", 2 + countAdjustment, "Create", showListOfAttributes: false);
            //7
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Assign", 2 + countAdjustment, "Assign", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Assign", 2 + countAdjustment, "Assign", showListOfAttributes: false);
            //8
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Update", 2 + countAdjustment, "Update", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Update", 2 + countAdjustment, "Update", showListOfAttributes: false);
            //9
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Revoke", 2 + countAdjustment, "Revoke", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Revoke", 2 + countAdjustment, "Revoke", showListOfAttributes: false);
            //10
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Delete", 2 + countAdjustment, "Delete", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Delete", 2 + countAdjustment, "Delete", showListOfAttributes: false);
        }

        #endregion
    }
}
