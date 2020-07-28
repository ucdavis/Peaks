using Keas.Mvc.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    [AutoValidateAntiforgeryTokenOrApiAttribute]
    public class SuperController : Controller
    {
        public string Team => ControllerContext.RouteData.Values["teamName"] as string;

        private const string TempDataMessageKey = "Message";
        private const string TempDataErrorMessageKey = "ErrorMessage";
        private const string TempDataTeamNameKey = "TeamName";
       
        public string Message
        {
            get => TempData[TempDataMessageKey] as string;
            set => TempData[TempDataMessageKey] = value;
        }

        public string ErrorMessage
        {
            get => TempData[TempDataErrorMessageKey] as string;
            set => TempData[TempDataErrorMessageKey] = value;
        }

        public string TeamName {
            get => TempData[TempDataTeamNameKey] as string;
            set => TempData[TempDataTeamNameKey] = value;
        }

        public override void OnActionExecuted(Microsoft.AspNetCore.Mvc.Filters.ActionExecutedContext context) => TempData[TempDataTeamNameKey] = Team;

    }
}
