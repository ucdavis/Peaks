using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Keas.Mvc.Controllers
{
    [AutoValidateAntiforgeryToken]
    [Authorize]
    public class SuperController : Controller
    {
        public string Team => ControllerContext.RouteData.Values["teamName"] as string;

        private const string TempDataMessageKey = "Message";

       
        public string Message
        {
            get => TempData[TempDataMessageKey] as string;
            set => TempData[TempDataMessageKey] = value;
        }



    }
}