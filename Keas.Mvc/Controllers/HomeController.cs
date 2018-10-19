using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authorization;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class HomeController : SuperController
    {
        
        public IActionResult Index()
        {            
            if (Team == null){
                return RedirectToAction("SelectTeam", "Confirm", new {urlRedirect = "home/index"} );
            }            
            return View();
        }

        public IActionResult NoAccess() 
        {
            // TODO Fix the instructions
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult React()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
