using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Models;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.SystemAdminAccess)]
    public class DocumentController : SuperController
    {
        private readonly IDocumentSigningService documentSigningService;

        public DocumentController(IDocumentSigningService documentSigningService)
        {
            this.documentSigningService = documentSigningService;
        }

        // send the given template to the provided person
        [HttpGet]        
        public async Task<IActionResult> SendTemplate(string email, string name, string templateId)
        {
            var envelope = await documentSigningService.SendTemplate(email, name, templateId);
            return Content("sent envelope " + envelope);
        }

        // get the status of recent envelopes for the given email address
        public async Task<IActionResult> List(string id)
        {
            // send tides template to scott @ gmail
            var envelopes = await documentSigningService.GetEnvelopes(id);
            return Json(envelopes);
        }

        // download a combined PDF of everything in the given enveloped
        public async Task<IActionResult> Download(string id) {
            var contentStream = await documentSigningService.DownloadEnvelope(id);
            return File(contentStream, "application/pdf", "combined.pdf");
        }
    }
}
