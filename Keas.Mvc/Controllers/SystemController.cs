using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Mvc.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Keas.Mvc.Controllers
{
    public class SystemController : SuperController
    {
        private readonly ApplicationDbContext _context;

        public SystemController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public IActionResult ResetDb()
        {
#if DEBUG
            DbInitializer.Initialize(_context);
            return Content("Success");
#else
            return Content("Not in Debug mode");
#endif
        }
    }
}