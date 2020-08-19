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
    [Authorize(Policy = AccessCodes.Codes.DocumentMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/documents/[action]")]
    public class DocumentsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentSigningService _documentSigningService;
        private readonly IEventService _eventService;

        public DocumentsController(ApplicationDbContext context, IDocumentSigningService documentSigningService, IEventService eventService)
        {
            this._context = context;
            this._documentSigningService = documentSigningService;
            this._eventService = eventService;
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

            if (!documents.Any()) {
                return Json(documents);
            }

            var envelopeIds = documents.Select(d => d.EnvelopeId).ToArray();

            var docusignEnvelopeInfo = await _documentSigningService.GetEnvelopes(envelopeIds);

            foreach (var doc in documents)
            {
                // find the matching envelopeId for this document and update the status
                var envelope = docusignEnvelopeInfo.Envelopes.FirstOrDefault(e => e.EnvelopeId == doc.EnvelopeId);

                if (envelope == null)
                {
                    doc.Status = "missing";
                }
                else
                {
                    doc.Status = envelope.Status;
                }
            }

            return Json(documents);
        }

        // Get a specific document's combined pdf
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(int id)
        {
            var document = await _context.Documents
                .Where(x => x.Team.Slug == Team && x.Id == id)
                .SingleAsync();

            var fileStream = await _documentSigningService.DownloadEnvelope(document.EnvelopeId);

            return File(fileStream, "application/pdf", document.Name + ".pdf");
        }

        // Get a specific document's combined pdf
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<TeamDocumentSetting>), StatusCodes.Status200OK)]
        public async Task<IActionResult> TeamSettings()
        {
            var teamSettings = await _context.TeamDocumentSettings
                .Where(x => x.Team.Slug == Team)
                .OrderBy(x => x.Name)
                .AsNoTracking()
                .ToListAsync();

            return Json(teamSettings);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Document), StatusCodes.Status200OK)]
        public async Task<IActionResult> Create([FromBody] Document document)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var envelope = await _documentSigningService.SendTemplate(document.Person.Email, document.Person.Name, document.TemplateId);

            var newDocument = new Document
            {
                Name = document.Name,
                PersonId = document.PersonId,
                TeamId = document.TeamId,
                EnvelopeId = envelope.EnvelopeId,
                TemplateId = document.TemplateId,
                Active = true,
                Status = "sent"
            };

            await _context.Documents.AddAsync(newDocument);
            await _eventService.TrackCreateDocument(newDocument);
            await _context.SaveChangesAsync();

            return Json(newDocument);
        }
    }
}
