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
using System;
using System.Net.Mime;
using Keas.Mvc.Models;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.DocumentMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/documents/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
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

            return Json(documents);
        }

        // Get a specific document's combined pdf
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
        [Produces(MediaTypeNames.Application.Pdf)]
        public async Task<IActionResult> Get(int id)
        {
            var document = await _context.Documents
                .Where(x => x.Team.Slug == Team && x.Id == id)
                .Include(x => x.Team)
                .SingleAsync();

            var fileStream = await _documentSigningService.DownloadEnvelope(document.Team, document.EnvelopeId);

            return File(fileStream, "application/pdf", document.Name + ".pdf");
        }

        // Get a specific document's combined pdf
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DocumentTemplateInfo>), StatusCodes.Status200OK)]
        public async Task<IActionResult> TeamSettings()
        {
            var team = await _context.Teams
                .AsNoTracking()
                .SingleAsync(t => t.Slug == Team);

            // Entire templates are being pulled just to extract name and id. Not sure if anything can be done about that.
            var templates = await _documentSigningService.GetTemplates(team);

            var documentTemplateInfos = templates
                .Select(x => new DocumentTemplateInfo
                {
                    TemplateId = x.TemplateId, Name = x.Name, TeamId = team.Id
                })
                .ToList();

            return Json(documentTemplateInfos);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Document), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody] Document document)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            // make sure the given person is actually part of the current team
            if (!await _context.People.AnyAsync(p => p.Team.Slug == Team && p.Id == document.PersonId)) {
                return NotFound();
            }

            var envelope = await _documentSigningService.SendTemplate(document);

            var newDocument = new Document
            {
                Name = document.Name,
                PersonId = document.PersonId,
                TeamId = document.TeamId,
                EnvelopeId = envelope.EnvelopeId,
                TemplateId = document.TemplateId,
                Active = true,
                Status = "sent",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Documents.AddAsync(newDocument);
            await _eventService.TrackCreateDocument(newDocument);
            await _context.SaveChangesAsync();

            return Json(newDocument);
        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Document), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Delete(int id)
        {
            var document = await _context.Documents.Where(x => x.Team.Slug == Team)
                .Include(x => x.Team)
                .SingleAsync(x => x.Id == id);

            if (document == null)
            {
                return NotFound();
            }

            if (!document.Active)
            {
                return BadRequest(ModelState);
            }

            using (var transaction = _context.Database.BeginTransaction())
            {
                document.Active = false;
                await _eventService.TrackDocumentDeleted(document);
                await _context.SaveChangesAsync();
                transaction.Commit();
                return Json(null);
            }

        }
    }
}
