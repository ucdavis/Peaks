using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Keas.Core.Models;
using Keas.Core.Data;
using Keas.Mvc.Services;
using System.Collections.Generic;
using Keas.Core.Domain;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers.Api
{
    // TODO: change to allow access to new document role
    [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/documents/[action]")]
    public class DocumentsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentSigningService _documentSigningService;

        public DocumentsController(ApplicationDbContext context, IDocumentSigningService documentSigningService)
        {
            this._context = context;
            this._documentSigningService = documentSigningService;
        }

        // List all documents for this team
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Document>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List()
        {
            var documents = await _context.Documents
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .Include(x => x.Person)
                .AsNoTracking().ToArrayAsync();

            return Json(documents);
        }

        // List all documents for the given person
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<Document>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Find(int id)
        {
            var documents = await _context.Documents
                .Where(x => x.Team.Slug == Team && x.PersonId == id)
                .Include(x => x.Team)
                .Include(x => x.Person)
                .AsNoTracking().ToArrayAsync();

            var envelopeIds = documents.Select(d => d.EnvelopeId).ToArray();

            var docusignEnvelopeInfo = await _documentSigningService.GetEnvelopes(envelopeIds);

            foreach (var doc in documents)
            {
                // find the matching envelopeId for this document and update the status
                var envelope = docusignEnvelopeInfo.Envelopes.FirstOrDefault(e => e.EnvelopeId == doc.EnvelopeId);

                if (envelope == null) {
                    doc.Status = "missing";
                } else {
                    doc.Status = envelope.Status;
                }
            }

            return Json(documents);
        }

        // Get a specific document's combined pdf
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<Document>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(int id)
        {
            var document = await _context.Documents
                .Where(x => x.Team.Slug == Team && x.Id == id)
                .SingleAsync();

            var fileStream = await _documentSigningService.DownloadEnvelope(document.EnvelopeId);

            return File(fileStream, "application/pdf", document.Name + ".pdf");
        }
    }
}
