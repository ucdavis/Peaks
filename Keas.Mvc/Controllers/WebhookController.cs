using System;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Keas.Core.Data;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Controllers
{
    [AllowAnonymous]
    public class WebhookController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly DocumentSigningSettings _documentSigningSettings;

        public WebhookController(ApplicationDbContext context, IOptions<DocumentSigningSettings> documentSigningSettings, IEventService eventService)
        {
            _context = context;
            _eventService = eventService;
            _documentSigningSettings = documentSigningSettings.Value;
        }

        [HttpGet]
        public IActionResult Index() {
            return Content("index");
        }

        [HttpPost]
        public async Task<IActionResult> Docusign(string id, [FromBody]DocuSignEnvelopeInformation data) {
            if (!string.Equals(id, _documentSigningSettings.CallbackUrlSecret, StringComparison.OrdinalIgnoreCase)) {
                return Unauthorized();
            }

            var document = await _context.Documents.SingleOrDefaultAsync(doc => doc.EnvelopeId == data.EnvelopeStatus.EnvelopeID);

            if (document == null) {
                return NotFound();
            }

            document.Status = data.EnvelopeStatus.Status;

            if (data.EnvelopeStatus.Completed.HasValue) {
                document.CompletedAt = data.EnvelopeStatus.Completed.Value;
            }

            await _eventService.TrackCreateDocument(document);
            await _context.SaveChangesAsync();
            return StatusCode(200);
        }
    }

    [XmlRoot("DocuSignEnvelopeInformation", Namespace = "http://www.docusign.net/API/3.0")]
    public class DocuSignEnvelopeInformation
    {
        public EnvelopeStatus EnvelopeStatus { get; set; }
    }

    public class EnvelopeStatus {
        public string EnvelopeID { get; set; }
        public string Status { get; set; }
        public DateTime? Completed { get; set; }
    }
}
