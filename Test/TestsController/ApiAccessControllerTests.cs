using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Controllers.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            ControllerReflection.ControllerPublicMethods(12);
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
            var apiVal = ControllerReflection.MethodExpectedAttribute<ApiExplorerSettingsAttribute>("GetTeam", 1, "GetTeam-1", showListOfAttributes: false);
            apiVal.ElementAt(0).IgnoreApi.ShouldBeTrue();
            //2
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Search", 3 + countAdjustment, "Search", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Search", 3 + countAdjustment, "Search", showListOfAttributes: false);
            var responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Search", 3 + countAdjustment, "Search", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //3
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //4
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //5
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //6
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Create", 3 + countAdjustment, "Create", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Create", 3 + countAdjustment, "Create", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Create", 3 + countAdjustment, "Create", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //7
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("AccessAssignment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //8
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Update", 3 + countAdjustment, "Update", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Update", 3 + countAdjustment, "Update", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Update", 3 + countAdjustment, "Update", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //9
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("UpdateAssignment", 3 + countAdjustment, "UpdateAssignment", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("UpdateAssignment", 3 + countAdjustment, "UpdateAssignment", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("UpdateAssignment", 3 + countAdjustment, "UpdateAssignment", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("AccessAssignment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //10
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("AccessAssignment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //11
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Access");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //12
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("History");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);

        }

        #endregion
    }
}
