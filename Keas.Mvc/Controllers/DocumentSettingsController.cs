using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.DepartmentAdminAccess)]
    public class DocumentSettingsController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentSigningService _documentSigningService;

        public DocumentSettingsController(ApplicationDbContext context, IDocumentSigningService documentSigningService)
        {
            _context = context;
            _documentSigningService = documentSigningService;
        }

        public async Task<ActionResult> Index()
        {
            var model = await _context.TeamDocumentSettings.Where(t => t.Team.Slug == Team).OrderBy(t=> t.Name).ToListAsync();
            return View(model);
        }

        public ActionResult Create()
        {
            return View();
        }
        
        [HttpPost]
        public async Task<ActionResult> Create(TeamDocumentSetting newDocSetting)
        {
            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);
            if (ModelState.IsValid)
            {
                if (!string.IsNullOrWhiteSpace(newDocSetting.TemplateId))
                {
                    if (await _context.TeamDocumentSettings.AnyAsync(a => a.TeamId == team.Id && (a.Name == newDocSetting.Name || a.TemplateId == newDocSetting.TemplateId)))
                    {
                        ModelState.AddModelError("Name", "This template Id or Name already exists (case insensitive)");
                    }
                }
            }

            try {
                // verify that the template can be accessed by our program.
                // TODO: make sure not only the template is accessible but that signers are setup properly
                await _documentSigningService.GetTemplate(newDocSetting.TemplateId);
            } catch {
                ModelState.AddModelError("TemplateId", $"The templateId {newDocSetting.TemplateId} was not found.  Please ensure you have shared the template as specified in the instructions");
            }

            if (ModelState.IsValid)
            {
                newDocSetting.Team = team;
                newDocSetting.Name = newDocSetting.Name.Trim();
                _context.TeamDocumentSettings.Add(newDocSetting);
                await _context.SaveChangesAsync();
                Message = "Document Template Linked";
                return RedirectToAction(nameof(Index));
            }
            Message = "An error occurred. Document Template could not be linked.";
            return View();
        }
        
        public async Task<ActionResult> Delete(int id)
        {
            var docSetting = await _context.TeamDocumentSettings.SingleAsync(t => t.Team.Slug == Team && t.Id == id);
            if (docSetting == null)
            {
                return NotFound();
            }
            return View(docSetting);
        }
        
        [HttpPost]
        public async Task<ActionResult> Delete(int id, TeamDocumentSetting docSetting)
        {
            var toDelete = await _context.TeamDocumentSettings.SingleAsync(t => t.Team.Slug == Team && t.Id == id);
            _context.Remove(toDelete);
            await _context.SaveChangesAsync();
            Message = "Document Setting deleted.";
            return RedirectToAction(nameof(Index));
        }
    }
}