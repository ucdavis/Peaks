using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ValidationException = CsvHelper.ValidationException;

namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.PersonManagerAccess)]
    public class PersonAdminController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IIdentityService _identityService;

        public PersonAdminController(ApplicationDbContext context, INotificationService notificationService, IIdentityService identityService)
        {
            _context = context;
            _notificationService = notificationService;
            _identityService = identityService;
        }

        public async Task<IActionResult> BulkEdit()
        {
            var model = new BulkEditModel();
            await PopulateBulkEdit(model);


            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> BulkEdit(BulkEditModel model)
        {
            var updatedCount = 0;
            var skippedCount = 0;

            // Values for unchecked changes must not block a different update or deletion.
            if (model.DeleteUsers || !model.UpdateCategory) ModelState.Remove(nameof(model.Category));
            if (model.DeleteUsers || !model.UpdateStartDate) ModelState.Remove(nameof(model.StartDate));
            if (model.DeleteUsers || !model.UpdateEndDate) ModelState.Remove(nameof(model.EndDate));
            if (model.DeleteUsers || !model.UpdateSupervisorEmail) ModelState.Remove(nameof(model.SupervisorEmail));
            if (model.DeleteUsers || !model.UpdateTags) ModelState.Remove(nameof(model.SelectedTags));

            var ids = new HashSet<int>();
            foreach (var value in (model.Ids ?? string.Empty).Split(','))
            {
                if (!int.TryParse(value.Trim(), NumberStyles.None, CultureInfo.InvariantCulture, out var id) || id <= 0)
                {
                    ModelState.AddModelError(string.Empty, "Select one or more valid people from the table.");
                    break;
                }
                ids.Add(id);
            }

            if (!model.DeleteUsers && !model.UpdateCategory && !model.UpdateEndDate && !model.UpdateStartDate && !model.UpdateSupervisorEmail && !model.UpdateTags)
            {
                ModelState.AddModelError(string.Empty, "Select at least one change to apply.");
            }

            if (!ModelState.IsValid) return await InvalidBulkEdit(model);

            var persons = await _context.People.Include(a => a.Supervisor)
                .Where(a => a.Team.Slug == Team && ids.Contains(a.Id)).ToListAsync();
            if (persons.Count != ids.Count)
            {
                ModelState.AddModelError(string.Empty, "Some selected people are no longer available in this team. Review your selection and try again.");
                return await InvalidBulkEdit(model);
            }

            if (model.DeleteUsers)
            {
                foreach (var person in persons)
                {
                    if (await _context.AccessAssignments.AnyAsync(a => a.PersonId == person.Id) ||
                        await _context.KeySerialAssignments.AnyAsync(a => a.PersonId == person.Id) ||
                        await _context.EquipmentAssignments.AnyAsync(a => a.PersonId == person.Id) ||
                        await _context.WorkstationAssignments.AnyAsync(a => a.PersonId == person.Id))
                    {
                        skippedCount++;
                        continue;
                    }

                    if (await _context.TeamPermissions.AnyAsync(a => a.TeamId == person.TeamId && a.UserId == person.UserId))
                    {
                        skippedCount++;
                        continue;
                    }

                    if (person.UserId == User.Identity.Name)
                    {
                        skippedCount++;
                        continue;
                    }

                    await _notificationService.PersonUpdated(person, null, Team, User.GetNameClaim(), User.Identity.Name, PersonNotification.Actions.Deactivated, "From Bulk Edit");
                    updatedCount++;
                    person.Active = false;
                }
            }
            else
            {
                int? supervisorId = null;
                if (model.UpdateCategory)
                {
                    var category = model.Category?.Trim();
                    model.Category = PersonCategories.Types.FirstOrDefault(a => a.Equals(category, StringComparison.OrdinalIgnoreCase));
                    if (model.Category == null && !string.IsNullOrEmpty(category) && category != "-- Not Set --")
                    {
                        ModelState.AddModelError(nameof(model.Category), "Choose a category from the list.");
                    }
                }

                if (model.UpdateTags)
                {
                    var allowedTags = await _context.Tags.Where(a => a.Team.Slug == Team).Select(a => a.Name).ToListAsync();
                    model.SelectedTags = (model.SelectedTags ?? Array.Empty<string>()).Distinct().ToArray();
                    if (model.SelectedTags.Any(tag => !allowedTags.Contains(tag)))
                    {
                        ModelState.AddModelError(nameof(model.SelectedTags), "Choose tags that are available in this team.");
                    }
                }

                if (model.UpdateSupervisorEmail && !string.IsNullOrWhiteSpace(model.SupervisorEmail))
                {
                    var email = model.SupervisorEmail.Trim().ToUpperInvariant();
                    var supervisors = await _context.People.Where(a => a.Team.Slug == Team && a.Email.ToUpper() == email).Take(2).ToListAsync();
                    if (supervisors.Count != 1)
                    {
                        ModelState.AddModelError(nameof(model.SupervisorEmail), "Enter the email of exactly one active person in this team, or leave blank to clear the supervisor.");
                    }
                    else if (ids.Contains(supervisors[0].Id))
                    {
                        ModelState.AddModelError(nameof(model.SupervisorEmail), "A person cannot be their own supervisor. Remove the supervisor from the selected people.");
                    }
                    else
                    {
                        supervisorId = supervisors[0].Id;
                    }
                }

                if ((model.UpdateStartDate || model.UpdateEndDate) && persons.Any(person =>
                    (model.UpdateStartDate ? model.StartDate : person.StartDate)?.Date >
                    (model.UpdateEndDate ? model.EndDate : person.EndDate)?.Date))
                {
                    ModelState.AddModelError(model.UpdateEndDate ? nameof(model.EndDate) : nameof(model.StartDate),
                        "These changes would put an end date before a start date for at least one selected person.");
                }

                // Validate the entire selection before changing any tracked person.
                if (!ModelState.IsValid) return await InvalidBulkEdit(model);

                foreach (var person in persons)
                {

                    if (model.UpdateCategory)
                    {
                        person.Category = model.Category ?? string.Empty;
                    }

                    if (model.UpdateStartDate)
                    {
                        person.StartDate = model.StartDate;
                    }

                    if (model.UpdateEndDate)
                    {
                        person.EndDate = model.EndDate;
                    }

                    if (model.UpdateSupervisorEmail)
                    {
                        person.SupervisorId = supervisorId;
                    }

                    if (model.UpdateTags)
                    {
                        if (model.SelectedTags == null || model.SelectedTags.Length == 0)
                        {
                            person.Tags = string.Empty;
                        }
                        else
                        {
                            person.Tags = string.Join(",", model.SelectedTags);
                        }
                    }
                    updatedCount++;
                }
            }

            _context.UpdateRange(persons);
            await _context.SaveChangesAsync();
            model.DeleteUsers = false;
            ModelState.Remove(nameof(model.DeleteUsers));
            await PopulateBulkEdit(model);
            Message = $"{ids.Count} people selected. Updated: {updatedCount} Skipped: {skippedCount}";
            return View(model);
        }

        private async Task<IActionResult> InvalidBulkEdit(BulkEditModel model)
        {
            ErrorMessage = "No changes were saved. Correct the invalid fields or selection and try again.";
            await PopulateBulkEdit(model);
            return View(nameof(BulkEdit), model);
        }

        public IActionResult UploadPeople()
        {
            var model = new PeopleImportModel
            {
                UpdateExistingUsers = false,
                ImportResult = new List<PeopleImportResult>()
            };
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> UploadPeople(PeopleImportModel model)
        {
            var resultsView = new List<PeopleImportResult>();
            if (model.File == null || model.File.Length <= 0)
            {
                ErrorMessage = "No file, or an empty file selected.";
                return View(model);
            }

            var userIdentity = User.Identity.Name;
            var userName = User.GetNameClaim();
            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);
            using (var reader = new StreamReader(model.File.OpenReadStream()))
            using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                PrepareHeaderForMatch = (string header, int index) => header.ToLower().Replace(" ", string.Empty),
                TrimOptions = TrimOptions.Trim
            }))
            {
                var record = new PeopleImport();
                var records = csv.EnumerateRecords(record);

                try
                {
                    csv.Read();
                    csv.ReadHeader();
                    csv.ValidateHeader(typeof(PeopleImport));
                }
                catch (HeaderValidationException e)
                {
                    var firstSentence = e.Message.Split('.');
                    ErrorMessage = firstSentence.FirstOrDefault() ?? "Error Detected";
                    return View(model);
                }


                var counter = 1;
                try  //Or, I could make the start and end dates strings and then try to parse them into dates
                {
                    foreach (var r in records)
                    {
                        counter++;
                        var importResult = new PeopleImportResult(r);
                        importResult.LineNumber = csv.Context.Row;
                        importResult.Success = true;

                        if (string.IsNullOrWhiteSpace(r.OverrideEmail))
                        {
                            r.OverrideEmail = null; //Need this or the validation of the email will be triggered for an empty string
                        }

                        try
                        {
                            //validate
                            ICollection<ValidationResult> valResults = new List<ValidationResult>();
                            var context = new ValidationContext(r);
                            Validator.TryValidateObject(r, context, valResults, true); //Need to validate all properties
                            if (valResults.Count > 0)
                            {
                                foreach (var validationResult in valResults)
                                {
                                    importResult.ErrorMessage.Add(validationResult.ErrorMessage);
                                }
                            }
                        }
                        catch (ValidationException)
                        {
                            importResult.ErrorMessage.Add("Validation Exception for this row.");
                        }

                        if (importResult.ErrorMessage.Count > 0)
                        {
                            importResult.Success = false;
                        }
                        else
                        {
                            if (!model.UpdateExistingUsers && await _context.People.AnyAsync(a => a.Active && a.UserId == r.KerbId && a.TeamId == team.Id))
                            {
                                importResult.Messages.Add($"KerbId {r.KerbId} Already active in team, no changes made.");
                                importResult.Success = false;
                            }
                        }


                        if (importResult.Success)
                        {
                            Person person = null;
                            if (model.UpdateExistingUsers)
                            {
                                person = await _context.People.FirstOrDefaultAsync(a => a.Active && a.UserId == r.KerbId && a.TeamId == team.Id);
                            }
                            try
                            {
                                if (person == null)
                                {
                                    var personResult = await _identityService.GetOrCreatePersonFromKerberos(r.KerbId, team.Id, team, userName, userIdentity, "CSV People Import");
                                    person = personResult.Person;
                                }

                                await PopulatePerson(r, person, importResult, team);

                                await _context.SaveChangesAsync();
                            }
                            catch (Exception)
                            {
                                person = null;
                                importResult.Success = false;
                                importResult.ErrorMessage.Add($"!!!!!!!!!!!!!THERE IS A PROBLEM WITH KerbUser {r.KerbId} PLEASE CONTACT PEAKS HELP with this User ID.!!!!!!!!!!!!!!!");
                            }

                            if (person == null)
                            {
                                importResult.Success = false;
                                importResult.ErrorMessage.Add($"KerbId not found.");
                            }
                        }


                        resultsView.Add(importResult);
                    }
                }
                catch (Exception)
                {
                    counter++;
                    var importResult = new PeopleImportResult(new PeopleImport());
                    importResult.Success = false;
                    importResult.LineNumber = counter;
                    importResult.ErrorMessage.Add("There is a problem with this row preventing it from being imported. Maybe an invalid date format. Import Halted.");
                    resultsView.Add(importResult);
                    ErrorMessage = "Import halted.";
                }

            }

            if (resultsView.Count <= 0)
            {
                ErrorMessage = "No rows in file";
            }

            model.ImportResult = resultsView;

            return View(model);
        }

        private async Task PopulatePerson(PeopleImport r, Person person, PeopleImportResult importResult, Team team)
        {
            if (!string.IsNullOrWhiteSpace(r.OverrideFirstName))
            {
                person.FirstName = r.OverrideFirstName;
            }

            if (!string.IsNullOrWhiteSpace(r.OverrideLastName))
            {
                person.LastName = r.OverrideLastName;
            }

            if (!string.IsNullOrWhiteSpace(r.OverrideEmail))
            {
                person.Email = r.OverrideEmail;
            }

            if (r.StartDate.HasValue)
            {
                person.StartDate = r.StartDate.Value;
            }

            if (r.EndDate.HasValue)
            {
                person.EndDate = r.EndDate.Value;
            }

            if (!string.IsNullOrWhiteSpace(r.Category))
            {
                if (PersonCategories.Types.Contains(r.Category.Trim(), StringComparer.OrdinalIgnoreCase))
                {
                    person.Category = PersonCategories.Types.Single(a =>
                        a.Equals(r.Category.Trim(), StringComparison.OrdinalIgnoreCase));
                }
                else
                {
                    importResult.Messages.Add("Warning, supplied category not found. Value not set.");
                }
            }

            if (!string.IsNullOrWhiteSpace(r.SupervisorKerbId))
            {
                try
                {
                    var superGuy = await _context.People.FirstOrDefaultAsync(a => a.UserId == r.SupervisorKerbId.Trim() && a.TeamId == team.Id);
                    if (superGuy == null)
                    {
                        importResult.Messages.Add("Supplied SuperviorId not found in team.");
                    }
                    else
                    {
                        person.Supervisor = superGuy;
                        _context.Attach(person.Supervisor);
                    }
                }
                catch (Exception)
                {
                    importResult.Messages.Add("An error happened trying to set the supervisor. Value not set.");
                }

            }

            if (!string.IsNullOrWhiteSpace(r.OverrideTitle))
            {
                person.Title = r.OverrideTitle;
            }

            if (!string.IsNullOrWhiteSpace(r.HomePhone))
            {
                try
                {
                    person.HomePhone = r.HomePhone;
                }
                catch (Exception)
                {
                    person.HomePhone = null;
                }

                if (string.IsNullOrWhiteSpace(person.HomePhone))
                {
                    importResult.Messages.Add("Supplied Home Phone is not a valid phone number format. Value not set.");
                }
            }
            if (!string.IsNullOrWhiteSpace(r.TeamPhone))
            {
                try
                {
                    person.TeamPhone = r.TeamPhone;
                }
                catch (Exception)
                {
                    person.TeamPhone = null;
                }

                if (string.IsNullOrWhiteSpace(person.TeamPhone))
                {
                    importResult.Messages.Add("Supplied Team Phone is not a valid phone number format. Value not set.");
                }
            }

            if (!string.IsNullOrWhiteSpace(r.Notes))
            {
                person.Notes = r.Notes;
            }

            person.Tags = string.IsNullOrWhiteSpace(r.Tags) ? "Imported" : $"{r.Tags},Imported";

            return;
        }

        private async Task PopulateBulkEdit(BulkEditModel model)
        {
            model.BulkPersons = await _context.ExtendedPersonViews.Where(a => a.Slug == Team).Select(a => new PersonBulkEdit
            {
                Id = a.Id,
                UserId = a.UserId,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email,
                Tags = a.Tags,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                Category = a.Category,
                SupervisorName = a.SupervisorId == null ? null : $"{a.S_FirstName} {a.S_LastName} ({a.S_Email})",
                AddedDate = a.LastAddDate,
            }).ToListAsync();
            model.CategoryChoices = new List<string>();
            model.CategoryChoices.Add("-- Not Set --");
            model.CategoryChoices.AddRange(PersonCategories.Types);
            model.Tags = await _context.Tags.Where(a => a.Team.Slug == Team).Select(a => a.Name).ToListAsync();
        }

    }
}
