using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    public class ErrorController : Controller
    {
        public IActionResult Index(int statusCode)
        {
            return View(statusCode);
        }

        
    }
}