using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Models;
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
            var userInfo = _documentSigningService.GetUserInfo();

            var accounts = userInfo.Accounts.Select(a => new DocumentSigningAccount {
                    AccountId = a.AccountId,
                    AccountName = a.AccountName,
                    ApiBasePath = a.BaseUri,
                    IsDefault = bool.Parse(a.IsDefault)})
                .ToList();

            var team = await _context.Teams
                .Where(t => t.Slug == Team).SingleAsync();

            var teamAccount = await _context.Teams
                .Where(t => t.Slug == Team)
                .Select(t => new DocumentSigningAccount
                {
                    AccountId = t.DocumentAccountId,
                    AccountName = t.DocumentAccountName,
                    ApiBasePath = t.DocumentApiBasePath
                })
                .SingleAsync();

            var teamDocumentSettings = await _context.TeamDocumentSettings
                .Where(t => t.Team.Slug == Team)
                .ToListAsync();

            var model = new TeamDocumentSettingsModel
            {
                AvailableAccounts = accounts,
                TeamDocumentSettings = teamDocumentSettings,
                TeamAccount = teamAccount
            };

            if (!string.IsNullOrWhiteSpace(team.DocumentAccountId))
            {
                try
                {
                    var templates = await _documentSigningService.GetTemplates(team);
                    model.TemplateNames = templates.Select(a => new TemplateModel { Name = a.Name, Id = a.TemplateId}).ToList();
                }
                catch
                {
                    model.TemplateNames = new List<TemplateModel>();
                }
            }

            return View(model);
        }

        [HttpPost]
        public async Task<ActionResult> SelectAccount(string AccountId)
        {
            var account = _documentSigningService.GetUserInfo()
                .Accounts.Single(a => a.AccountId == AccountId);

            if (account != null)
            {
                var team = await _context.Teams.SingleAsync(t => t.Slug == Team);
                team.DocumentAccountName = account.AccountName;
                team.DocumentAccountId = account.AccountId;
                team.DocumentApiBasePath = account.BaseUri;
                await _context.SaveChangesAsync();

                Message = $"{team.DocumentAccountName} Docusign account associated with this team.";
            }

            return RedirectToAction("Index");
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
                await _documentSigningService.GetTemplate(team, newDocSetting.TemplateId);
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
