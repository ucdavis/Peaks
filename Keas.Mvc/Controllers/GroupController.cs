using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    public class GroupController : SuperController
    {
        public IActionResult Index(int id)
        {
            return View();
        }
    }
}
