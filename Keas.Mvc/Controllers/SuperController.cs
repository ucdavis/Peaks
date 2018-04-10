using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
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