using Keas.Core.Models;
using Keas.Mvc.Attributes;
using Keas.Mvc.Controllers.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shouldly;
using System.Linq;
using System.Net.Mime;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Http;
using TestHelpers.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class ApiEquipmentControllerTests
    {
        //TODO
    }

    [Trait("Category", "ControllerTests")]
    public class ApiEquipmentControllerReflectionTests
    {
        private readonly ITestOutputHelper output;
        public ControllerReflection ControllerReflection;

        public ApiEquipmentControllerReflectionTests(ITestOutputHelper output)
        {
            this.output = output;
            ControllerReflection = new ControllerReflection(this.output, typeof(EquipmentController));
        }

        #region Controller Class Tests

        [Fact]
        public void TestControllerClassAttributes()
        {
            ControllerReflection.ControllerInherits("SuperController");
            var authAttribute = ControllerReflection.ClassExpectedAttribute<AuthorizeAttribute>(6);
            authAttribute.ElementAt(0).Roles.ShouldBe(null);
            authAttribute.ElementAt(0).Policy.ShouldBe(AccessCodes.Codes.EquipMasterAccess);

            ControllerReflection.ClassExpectedAttribute<AutoValidateAntiforgeryTokenOrApiAttribute>(6);
            ControllerReflection.ClassExpectedAttribute<ControllerAttribute>(6);
            ControllerReflection.ClassExpectedAttribute<ApiControllerAttribute>(6);

            var attribProduces = ControllerReflection.ClassExpectedAttribute<ProducesAttribute>(6);
            attribProduces.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            attribProduces.Count().ShouldBe(1);
            attribProduces.ElementAt(0).ContentTypes.Count.ShouldBe(1);

            var route = ControllerReflection.ClassExpectedAttribute<RouteAttribute>(6);
            route.ElementAt(0).Template.ShouldBe("api/{teamName}/equipment/[action]");
        }

        #endregion Controller Class Tests

        #region Controller Method Tests

        [Fact]
        public void TestControllerContainsExpectedNumberOfPublicMethods()
        {
            ControllerReflection.ControllerPublicMethods(18);
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
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Search", 3 + countAdjustment, "Search", showListOfAttributes: true);
            var responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Search", 3 + countAdjustment, "Search", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //3
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("GetEquipmentInSpace", 3 + countAdjustment, "GetEquipmentInSpace", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("GetEquipmentInSpace", 3 + countAdjustment, "GetEquipmentInSpace", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("GetEquipmentInSpace", 3 + countAdjustment, "GetEquipmentInSpace", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //4
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("CommonAttributeKeys", 3 + countAdjustment, "CommonAttributeKeys", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("CommonAttributeKeys", 3 + countAdjustment, "CommonAttributeKeys", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("CommonAttributeKeys", 3 + countAdjustment, "CommonAttributeKeys", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("EquipmentAttributeKey");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //5
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("ListEquipmentTypes", 2, "ListEquipmentTypes", showListOfAttributes: false);
            //6
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("ListAssigned", 3 + countAdjustment, "ListAssigned", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //7
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("List", 3 + countAdjustment, "List", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //8
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Details", 3 + countAdjustment, "Details", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //9
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Create", 4 + countAdjustment, "Create", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Create", 4 + countAdjustment, "Create", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Create", 4 + countAdjustment, "Create", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            var response2 = ControllerReflection.MethodExpectedAttribute<ConsumesAttribute>("Create", 4 + countAdjustment, "Create", showListOfAttributes: false);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            //10
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Assign", 3 + countAdjustment, "Assign", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            //11
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Update", 4 + countAdjustment, "Update", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Update", 4 + countAdjustment, "Update", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Update", 4 + countAdjustment, "Update", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            response2 = ControllerReflection.MethodExpectedAttribute<ConsumesAttribute>("Update", 4 + countAdjustment, "Create", showListOfAttributes: false);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            //12
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Revoke", 3 + countAdjustment, "Revoke", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            //13
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Delete", 3 + countAdjustment, "Delete", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);
            //14
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("GetHistory", 3 + countAdjustment, "GetHistory", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("History");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //15
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("GetComputer", 3 + countAdjustment, "GetComputer", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("GetComputer", 3 + countAdjustment, "GetComputer", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("GetComputer", 3 + countAdjustment, "GetComputer", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("ServiceNowPropertyWrapper");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //16
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("GetComputersBySearch", 3 + countAdjustment, "GetComputersBySearch", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("GetComputersBySearch", 3 + countAdjustment, "GetComputersBySearch", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("GetComputersBySearch", 3 + countAdjustment, "GetComputersBySearch", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("ServiceNowPropertyWrapper");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            //17
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("SearchAttributes", 3 + countAdjustment, "SearchAttributes", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<HttpGetAttribute>("SearchAttributes", 3 + countAdjustment, "SearchAttributes", showListOfAttributes: true);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("SearchAttributes", 3 + countAdjustment, "SearchAttributes", showListOfAttributes: false);
            responseType.ElementAt(0).Type.GenericTypeArguments.ElementAt(0).Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);

            //17
            ControllerReflection.MethodExpectedAttribute<HttpPostAttribute>("Duplicate", 4 + countAdjustment, "Duplicate", showListOfAttributes: false);
            ControllerReflection.MethodExpectedAttribute<AsyncStateMachineAttribute>("Duplicate", 4 + countAdjustment, "Duplicate", showListOfAttributes: false);
            responseType = ControllerReflection.MethodExpectedAttribute<ProducesResponseTypeAttribute>("Duplicate", 4 + countAdjustment, "Duplicate", showListOfAttributes: false);
            responseType.ElementAt(0).Type.Name.ShouldBe("Equipment");
            responseType.ElementAt(0).StatusCode.ShouldBe(StatusCodes.Status200OK);
            response2 = ControllerReflection.MethodExpectedAttribute<ConsumesAttribute>("Duplicate", 4 + countAdjustment, "Duplicate", showListOfAttributes: false);
            response2.Count().ShouldBe(1);
            response2.ElementAt(0).ContentTypes.Count.ShouldBe(1);
            response2.ElementAt(0).ContentTypes.ElementAt(0).ShouldBe(MediaTypeNames.Application.Json);

        }

        #endregion
    }
}
