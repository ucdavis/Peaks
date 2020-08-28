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
using Serilog;

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
            Log.ForContext("envelopeInfo", data).Debug("Webhook received from DocuSign for envelope " + data.EnvelopeStatus.EnvelopeID);

            if (!string.Equals(id, _documentSigningSettings.CallbackUrlSecret, StringComparison.OrdinalIgnoreCase)) {
                return Unauthorized();
            }

            var document = await _context.Documents.IgnoreQueryFilters().SingleOrDefaultAsync(doc => doc.EnvelopeId == data.EnvelopeStatus.EnvelopeID);

            if (document == null) {
                return NotFound();
            }

            document.Status = data.EnvelopeStatus.Status;

            if (data.EnvelopeStatus.Completed.HasValue) {
                document.CompletedAt = data.EnvelopeStatus.Completed.Value;
            }

            await _eventService.TrackDocumentStatusChange(document);
            await _context.SaveChangesAsync();

            // return the envelopeID to acknowledge receipt.  If docusign doesn't get this, they will retry the callback
            // see: https://stackoverflow.com/questions/28733094/how-to-acknowledge-a-docusign-connect-event
            var ackContent = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <soap:Envelope xmlns:soap = ""http://schemas.xmlsoap.org/soap/envelope/"">
                    <soap:Body>
                        <soap:response>
                            <EnvelopeID>{{envelopeid}}</EnvelopeID>
                        </soap:response>
                    </soap:Body>
                </soap:Envelope>";

            ackContent = ackContent.Replace("{{envelopeid}}", data.EnvelopeStatus.EnvelopeID);

            return Content(ackContent, "application/xml");
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
