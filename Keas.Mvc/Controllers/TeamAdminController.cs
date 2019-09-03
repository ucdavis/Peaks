using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;
using System.IO;
using System.Runtime.CompilerServices;
using CsvHelper;
using Microsoft.AspNetCore.Http;
using System.Text;
using Keas.Core.Extensions;
using Keas.Core.Resources;
using Keas.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc.ModelBinding;


namespace Keas.Mvc.Controllers
{
    [Authorize(Policy = AccessCodes.Codes.DepartmentOrSystemAdminAccess)]
    public class TeamAdminController : SuperController
    {
        // TODO: Authorize to appropriate roles. Maybe just require DA or SystemAdmin?

        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        private readonly IUserService _userService;
        private readonly IFinancialService _financialService;
        private readonly INotificationService _notificationService;
        private readonly IBigfixService _bigfixService;


        public TeamAdminController(ApplicationDbContext context, IIdentityService identityService, IUserService userService, IFinancialService financialService, INotificationService notificationService, IBigfixService bigfixService)
        {
            _context = context;
            _identityService = identityService;
            _userService = userService;
            _financialService = financialService;
            _notificationService = notificationService;
            _bigfixService = bigfixService;
        }

        public async Task<IActionResult> Index()
        {

            var team = await _context.Teams
                .Include(o => o.FISOrgs)
                .Include(i => i.PpsDepartments)
                .SingleOrDefaultAsync(x => x.Slug == Team);

            return View(team);
        }

        public async Task<IActionResult> TestBigfix(string id)
        {
            if (id != null && id.Equals("os", StringComparison.OrdinalIgnoreCase))
            {
                var os = await _bigfixService.TestOs();
                return Content(os);
            }
            else
            {
                return Content(await _bigfixService.TestLookupComputer());
            }
        }


        [HttpPost]
        public async Task<IActionResult> UpdateEmail(int id, Team team)
        {
            var teamToUpdate = await _context.Teams.SingleAsync(a => a.Id == id && a.Slug == Team);

            if (teamToUpdate.BoardingNotificationEmail != team.BoardingNotificationEmail.SafeToLower())
            {
                teamToUpdate.BoardingNotificationEmail = team.BoardingNotificationEmail.SafeToLower();
                ModelState.Clear();
                TryValidateModel(teamToUpdate);
                if (!ModelState.IsValid)
                {
                    ErrorMessage = "Invalid email. Not Updated";
                    return RedirectToAction("Index");
                }
                Message = "Email Updated.";
                await _context.SaveChangesAsync();
            }
            else
            {
                Message = "Email not changed.";
            }
            
            return RedirectToAction("Index");
        }

        public IActionResult AddFISOrg()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddFISOrg(FISOrgAddModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            model.OrgCode = model.OrgCode.ToUpper();
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }
            var foundInSpaces = await _context.Spaces.FirstOrDefaultAsync(a => a.Active && a.ChartNum == model.Chart && a.OrgId == model.OrgCode);
            if (!await _financialService.ValidateFISOrg(model.Chart, model.OrgCode))
            {
                if (foundInSpaces != null)
                {
                    ErrorMessage = "Warning, Org is used in spaces, but not currently valid. Adding anyway.";
                }
                else
                {
                    ModelState.AddModelError("OrgCode", "Chart and OrgCode are not valid");
                }
            }
            else
            {
                if (foundInSpaces == null)
                {
                    ErrorMessage = "Warning, Org is valid, but not used in spaces.";
                }
            }

            var FISOrg = new FinancialOrganization { Chart = model.Chart, OrgCode = model.OrgCode, Team = team };

            if (ModelState.IsValid)
            {
                _context.FISOrgs.Add(FISOrg);
                await _context.SaveChangesAsync();
                Message = "New FIS Org added to team.";
                return RedirectToAction(nameof(Index));
            }
            return View();
        }

        public async Task<IActionResult> SearchBuilding(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                ErrorMessage = "Please select a building name or part of a building name to search.";                
                return View(new List<SpaceSearchModel>());
            }
            var model = await _context.Spaces
                    .Where(a => a.BldgName.ToLower().Contains(id.ToLower()))
                    .Select(a => new SpaceSearchModel(){BldgName = a.BldgName, DeptName = a.DeptName, ChartNum = a.ChartNum, OrgId = a.OrgId}).Distinct().ToListAsync();

            return View(model);
        }

        public async Task<IActionResult> RemoveFISOrg(int fisorgId)
        {
            var fisOrg = await _context.FISOrgs.Include(t => t.Team).SingleAsync(f => f.Id == fisorgId && f.Team.Slug == Team);
            if (fisOrg == null)
            {
                Message = "FIS Org not found or not attached to this team";
                return RedirectToAction(nameof(Index));
            }
            return View(fisOrg);

        }

        [HttpPost]
        public async Task<IActionResult> RemoveFISOrg(FinancialOrganization org)
        {
            _context.Remove(org);
            await _context.SaveChangesAsync();
            Message = "FIS Org removed";
            return RedirectToAction(nameof(Index));


        }

        public async Task<IActionResult> RoledMembers()
        {
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp => tp.User)
                .Include(t => t.TeamPermissions)
                    .ThenInclude(tp => tp.Role)
                .SingleAsync(x => x.Slug == Team);

            var viewModel = TeamAdminMembersListModel.Create(team, null);
            return View(viewModel);
        }

        public async Task<IActionResult> AddMemberRole()
        {
            var team = await _context.Teams.SingleAsync(x => x.Slug == Team);

            var viewModel = await TeamAdminMembersAddModel.Create(team, _context);
            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> AddMemberRole(TeamAdminMembersAddModel model)
        {
            var team = await _context.Teams.SingleAsync(x => x.Slug == Team);
            var viewModel = await TeamAdminMembersAddModel.Create(team, _context);
            if (team == null)
            {
                return NotFound();
            }
            if (model.RoleId == 0)
            {
                ModelState.AddModelError("RoleId", "Must select valid Role");
                return View(viewModel);
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.UserEmail || u.Id == model.UserEmail);
            var role = await _context.Roles.SingleOrDefaultAsync(r => r.Id == model.RoleId);

            if (user == null)
            {
                if (model.UserEmail.Contains("@"))
                {
                    user = await _userService.CreateUserFromEmail(model.UserEmail);
                }
                else
                {
                    user = await _userService.CreateUserFromKerberos(model.UserEmail);
                }
            }

            if (user == null)
            {
                ModelState.AddModelError("UserEmail", "User Not found.");
                return View(viewModel);
            }

            // Check if already Team Person. Add if not.
            var person = await _context.People.IgnoreQueryFilters().SingleOrDefaultAsync(p => p.UserId == user.Id && p.TeamId == team.Id);
            if (person == null)
            {
                person = new Person();
                person.TeamId = team.Id;
                person.UserId = user.Id;
                person.FirstName = user.FirstName;
                person.LastName = user.LastName;
                person.Email = user.Email;
                person.Title = await _identityService.GetTitle(user.Iam);
                _context.People.Add(person);
                await _context.SaveChangesAsync();
            }
            else
            {
                if (!person.Active)
                {
                    person.Active = true;
                    await _context.SaveChangesAsync();
                }
            }

            if (role == null)
            {
                ModelState.AddModelError("RoleId", "Role not found!");
                return View(viewModel);
            }

            var existingTeamPermision =
                await _context.TeamPermissions.SingleOrDefaultAsync(tp =>
                    tp.Team == team && tp.Role == role && tp.User == user);

            if (existingTeamPermision != null)
            {
                ModelState.AddModelError(string.Empty, "User already in that role!");
                return View(viewModel);
            }

            var teamPermission = new TeamPermission { Role = role, Team = team, User = user };
            if (ModelState.IsValid)
            {
                _context.TeamPermissions.Add(teamPermission);
                await _context.SaveChangesAsync();
                Message = "User " + user.Name + " has been added as " + role.Name + " to the " + team.Name + " team.";
                return RedirectToAction(nameof(RoledMembers));
            }

            return View(viewModel);
        }

        public async Task<ActionResult> RemoveRoles(string userId)
        {
            if (userId == null)
            {
                Message = "User not provided";
                return RedirectToAction(nameof(RoledMembers));
            }
            var team = await _context.Teams
                .Include(t => t.TeamPermissions)
                .ThenInclude(tp => tp.User)
                .Include(t => t.TeamPermissions)
                .ThenInclude(tp => tp.Role)
                .SingleAsync(x => x.Slug == Team);
            var viewModel = TeamAdminMembersListModel.Create(team, userId);

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> RemoveRoles(string userId, int[] roles)
        {
            // TODO: any roles we should not list? Any roles we should not allow deleted?
            if (userId == null)
            {
                Message = "User not found!";
                return RedirectToAction(nameof(RoledMembers));
            }

            if (roles.Length < 1)
            {
                Message = "Must select a role to remove.";
                return RedirectToAction(nameof(RemoveRoles), new { userId = userId });
            }

            if (userId == User.Identity.Name)
            {
                if (await _context.TeamPermissions.AnyAsync(a =>
                    a.Team.Slug == Team && a.Role.Name.Equals(Role.Codes.DepartmentalAdmin) &&
                    roles.Contains(a.RoleId)))
                {
                    ErrorMessage =
                        "You can't remove your own roles if the role being removed is for Departmental Admin access. Please have another Admin remove your permissions if required.";
                    return RedirectToAction(nameof(RemoveRoles), new { userId = userId });
                }
            }

            foreach (var role in roles)
            {
                var teamPermssionToDelete = _context.TeamPermissions.Single(a => a.RoleId == role && a.UserId == userId && a.Team.Slug == Team);
                _context.TeamPermissions.Remove(teamPermssionToDelete);
            }
            await _context.SaveChangesAsync();
            Message = "User removed from role.";
            // TODO: Any reason to be more specific? E.g. "John removed from role(s) Keymaster,EquipMaster on team CAESDO".
            return RedirectToAction(nameof(RoledMembers));
        }

        public async Task<IActionResult> BulkLoadPeople()
        {
            var team = await _context.Teams.Include(i => i.PpsDepartments).SingleAsync(a => a.Slug == Team);
            return View(team.PpsDepartments);
        }

        [HttpPost]
        public async Task<IActionResult> LoadPeople()
        {
            var team = await _context.Teams.Include(i => i.PpsDepartments).SingleAsync(a => a.Slug == Team);
            if (!team.PpsDepartments.Any())
            {
                Message = "No PPS Departments found for your team. Please add them first.";
                return RedirectToAction("AddPpsDepartment");
            }

            var actorName = User.GetNameClaim();
            var actorId = User.Identity.Name;

            foreach (var teamPpsDepartment in team.PpsDepartments)
            {
                Message = $"{await _identityService.BulkLoadPeople(teamPpsDepartment.PpsDepartmentCode, Team, actorName, actorId)} for {teamPpsDepartment.DepartmentName}. {Message}";
            }

            return RedirectToAction(nameof(Index));
        }

        public IActionResult AddPpsDepartment()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddPpsDepartment(string ppsDeptCode)
        {
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(ppsDeptCode))
            {
                Message = "Code not entered";
                return View();
            }

            var result = await _identityService.GetPpsDepartment(ppsDeptCode);
            if (result == null)
            {
                Message = $"Code {ppsDeptCode} not found";
                return View();
            }

            if (await _context.TeamPpsDepartments.AnyAsync(a => a.TeamId == team.Id && a.PpsDepartmentCode == result.deptCode))
            {
                Message = $"Code {ppsDeptCode} was already added";
                return RedirectToAction("Index");
            }

            var newPpsDepartment = new TeamPpsDepartment();
            newPpsDepartment.DepartmentName = result.deptDisplayName;
            newPpsDepartment.PpsDepartmentCode = result.deptCode;
            newPpsDepartment.Team = team;

            _context.TeamPpsDepartments.Add(newPpsDepartment);
            await _context.SaveChangesAsync();

            Message = $"Department {newPpsDepartment.DepartmentName} added";

            return RedirectToAction("Index");
        }

        public async Task<IActionResult> RegenerateApiCode()
        {
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }
            return View(team);
        }

        [HttpPost]
        public async Task<IActionResult> RegenerateApiCode(Team team)
        {
            var teamToEdit = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (teamToEdit == null)
            {
                return NotFound();
            }
            teamToEdit.ApiCode = Guid.NewGuid();
            await _context.SaveChangesAsync();
            Message = "API Code updated";

            return RedirectToAction("RegenerateApiCode");

        }


        public async Task<IActionResult> RemovePpsDepartment(int id)
        {
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }

            var ppsDept = await _context.TeamPpsDepartments.SingleAsync(a => a.Id == id && a.TeamId == team.Id);

            return View(ppsDept);
        }

        [HttpPost]
        public async Task<IActionResult> RemovePpsDepartment(int id, TeamPpsDepartment ppsDepartment)
        {
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }

            if (id != ppsDepartment.Id)
            {
                throw new Exception("Ids don't match");
            }

            var ppsDeptToDelete = await _context.TeamPpsDepartments.SingleAsync(a => a.Id == id && a.TeamId == team.Id);
            _context.TeamPpsDepartments.Remove(ppsDeptToDelete);
            await _context.SaveChangesAsync();

            Message = "PPS Department Removed";

            return RedirectToAction("Index");
        }

        private string GetModelErrors(ModelStateDictionary modelState)
        {
            var resultsList = new List<string>();
            foreach (var result in modelState.Values)
            {
                foreach (var errs in result.Errors)
                {
                    resultsList.Add(errs.ErrorMessage);
                }
            }

            var rtValue = "";
            foreach (var s in resultsList)
            {
                rtValue = rtValue + "\n" + s;
            }
            return rtValue;
        }

        public IActionResult Upload()
        {
            return View();
        }

        public IActionResult UploadKeys()
        {
            var model = new List<KeyImportResults>();
            return View(model);

        }

        [HttpPost]
        public async Task<IActionResult> UploadKeys(IFormFile file)
        {
            var resultsView = new List<KeyImportResults>();

            var userIdentity = User.Identity.Name;
            var userName = User.GetNameClaim();

            var keyCount = 0;
            var serialCount = 0;
            var peopleCount = 0;
            var assignmentCount = 0;
            var errorCount = 0;
            //var reactivatedCount = 0; Not used
            var rowNumber = 1;
            bool import = true;
            bool somethingSaved = false;

            if (file == null || file.Length == 0)
            {
                Message = "File not selected";
                return RedirectToAction("Upload");
            }

            // Add counts
            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);
            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader))
            {
                csv.Configuration.PrepareHeaderForMatch = (string header, int index) => header.ToLower();
                var record = new KeyImport();
                var records = csv.EnumerateRecords(record);

                try
                {
                    csv.Read();
                    csv.ReadHeader();
                    csv.ValidateHeader(typeof(KeyImport));
                }
                catch (HeaderValidationException e)
                {
                    var firstSentence = e.Message.Split('.');
                    ErrorMessage = firstSentence.FirstOrDefault() ?? "Error Detected";
                    return View();
                }

                foreach (var r in records)
                {
                    var recKeyCount = 0;
                    var recSerialCount = 0;
                    var recPeopleCount = 0;
                    var recAssignmentCount = 0;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        somethingSaved = false;
                        rowNumber += 1;
                        var result = new KeyImportResults(r)
                        {
                            LineNumber = rowNumber,
                            Success = true
                        };
                        ModelState.Clear();

                        if (!string.IsNullOrWhiteSpace(r.KeyCode))
                        {
                            var key = await _context.Keys.SingleOrDefaultAsync(k =>
                                k.Team.Slug == Team && k.Active &&
                                k.Code.Equals(r.KeyCode.Trim(), StringComparison.OrdinalIgnoreCase));
                            if (key == null)
                            {
                                key = new Key();
                                key.Code = r.KeyCode.ToUpper().Trim();
                                key.TeamId = team.Id;
                                key.Name = r.KeyName.Trim();
                                key.Tags = string.IsNullOrWhiteSpace(r.KeyTags) ? "Imported" : $"{r.KeyTags},Imported";
                                key.Notes = r.KeyNotes.Trim();

                                ModelState.Clear();
                                TryValidateModel(key);
                                if (ModelState.IsValid)
                                {
                                    _context.Keys.Add(key);
                                    recKeyCount += 1;
                                    result.Messages.Add("Key Added.");
                                }
                                else
                                {
                                    result.Success = false;
                                    result.ErrorMessage.Add($"Invalid Key values Error(s): {GetModelErrors(ModelState)} ");
                                }
                            }
                            else
                            {
                                result.Messages.Add("Key Code already exists.");
                                if (!string.IsNullOrWhiteSpace(r.KeyNotes))
                                {
                                    result.Messages.Add("Key notes not changed.");
                                }

                                if (!string.IsNullOrWhiteSpace(r.KeyTags))
                                {
                                    result.Messages.Add("Key tags not changed.");
                                }
                            }

                            if (!string.IsNullOrWhiteSpace(r.SerialNumber))
                            {
                                var serial = await _context.KeySerials.SingleOrDefaultAsync(s =>
                                    s.KeyId == key.Id && s.Active && s.Number.Equals(r.SerialNumber.Trim(),
                                        StringComparison.OrdinalIgnoreCase));
                                if (serial == null)
                                {
                                    serial = new KeySerial();
                                    serial.Number = r.SerialNumber.Trim();
                                    serial.Name = r.SerialNumber.Trim();
                                    serial.Key = key;
                                    serial.Status = SetStatus(r.Status, result);
                                    serial.Notes = r.SerialNotes.Trim();

                                    serial.TeamId = team.Id;

                                    ModelState.Clear();
                                    //TryValidateModel(serial); This seems really slow with a large load. Trying manually checking
                                    if (string.IsNullOrWhiteSpace(serial.Name))
                                    {
                                        ModelState.AddModelError("KeySerial", "Name/Serial Number is required");
                                    }
                                    else
                                    {
                                        if (serial.Name.Length > 64)
                                        {
                                            ModelState.AddModelError("KeySerial", "Name/Serial Number has max 64 characters");
                                        }
                                    }
                                    if (ModelState.IsValid && result.Success)
                                    {
                                        _context.KeySerials.Add(serial);
                                        recSerialCount += 1;
                                        result.Messages.Add("Serial Added.");
                                    }
                                    else
                                    {
                                        result.Success = false;
                                        result.ErrorMessage.Add($"Invalid Serial values Error(s): {GetModelErrors(ModelState)} ");
                                    }

                                }
                                else
                                {
                                    result.Messages.Add("Serial Number already exists.");
                                }

                                //r.Status should never be null or empty at this point, but it doesn't really matter.
                                if (!string.IsNullOrWhiteSpace(r.KerbUser) &&
                                    (r.Status == "Active" || string.IsNullOrWhiteSpace(r.Status)))
                                {
                                    Person person = null;
                                    try
                                    {
                                        var personResult = await _identityService.GetOrCreatePersonFromKerberos(r.KerbUser, team.Id, team, userName, userIdentity, "CSV Import -- Keys");
                                        recPeopleCount += personResult.peopleCount;
                                        person = personResult.Person;
                                    }
                                    catch (Exception)
                                    {
                                        person = null;
                                        result.Success = false;
                                        result.ErrorMessage.Add($"!!!!!!!!!!!!!THERE IS A PROBLEM WITH KerbUser {r.KerbUser} PLEASE CONTACT PEAKS HELP with this User ID.!!!!!!!!!!!!!!!");
                                    }


                                    if (person == null)
                                    {
                                        result.Success = false;
                                        result.ErrorMessage.Add($"KerbUser not found.");
                                    }
                                    else
                                    {
                                        ModelState.Clear();
                                        var assignment =
                                            await _context.KeySerialAssignments.SingleOrDefaultAsync(a =>
                                                a.KeySerialId == serial.Id);
                                        import = true;
                                        if (assignment == null)
                                        {

                                            assignment = new KeySerialAssignment();
                                            if (r.DateIssued.HasValue && r.DateIssued < DateTime.Now)
                                            {
                                                assignment.RequestedAt = r.DateIssued.Value.ToUniversalTime();
                                            }
                                            else
                                            {
                                                ModelState.AddModelError("DateIssued",
                                                    "DateIssued value not supplied or not in the past.");
                                                import = false;
                                            }

                                            if (r.DateDue.HasValue && r.DateDue.Value > DateTime.Now)
                                            {
                                                assignment.ExpiresAt = r.DateDue.Value.ToUniversalTime();
                                            }
                                            else
                                            {
                                                ModelState.AddModelError("DateDue",
                                                    "DateDue value not supplied or not in the future.");
                                                import = false;
                                            }

                                            assignment.PersonId = person.Id;
                                            assignment.KeySerialId = serial.Id;
                                            assignment.RequestedById = userIdentity;
                                            assignment.RequestedByName = userName;
                                            serial.KeySerialAssignment = assignment;


                                            TryValidateModel(assignment);
                                            if (ModelState.IsValid && import && result.Success)
                                            {
                                                _context.KeySerialAssignments.Add(assignment);
                                                await _context.SaveChangesAsync();
                                                somethingSaved = true;
                                                serial.KeySerialAssignment = assignment;
                                                serial.KeySerialAssignmentId = assignment.Id;
                                                recAssignmentCount += 1;
                                            }
                                            else
                                            {
                                                result.Success = false;
                                                result.ErrorMessage.Add($"Invalid Assignment values Error(s): {GetModelErrors(ModelState)} ");
                                                //Clear out values on error, otherwise it can throw a foreign key exception the next time through for the same person
                                                assignment = new KeySerialAssignment();
                                                serial.KeySerialAssignment = null;
                                            }
                                        }
                                        else
                                        {
                                            if (r.DateIssued.HasValue && r.DateIssued < DateTime.Now)
                                            {
                                                assignment.RequestedAt = r.DateIssued.Value.ToUniversalTime();
                                            }
                                            else
                                            {
                                                ModelState.AddModelError("DateIssued",
                                                    "DateIssued value not supplied or not in the past.");
                                                import = false;
                                            }

                                            if (r.DateDue.HasValue && r.DateDue.Value > DateTime.Now)
                                            {
                                                assignment.ExpiresAt = r.DateDue.Value.ToUniversalTime();
                                            }
                                            else
                                            {
                                                ModelState.AddModelError("DateDue", "DateDue value not supplied or not in the future.");
                                                import = false;
                                            }

                                            if (import)
                                            {
                                                assignment.PersonId = person.Id;
                                                assignment.KeySerialId = serial.Id;
                                                assignment.RequestedById = userIdentity;
                                                assignment.RequestedByName = userName;
                                            }
                                            else
                                            {
                                                result.ErrorMessage.Add($"Assignment not updated, error(s): {GetModelErrors(ModelState)}");
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    if (!string.IsNullOrWhiteSpace(r.KerbUser))
                                    {
                                        result.Messages.Add("Supplied kerbUser to assign not used as Serial was not Active.");
                                    }
                                }
                            }
                            else
                            {
                                result.Messages.Add("No Serial Number supplied");
                            }

                            try
                            {
                                await _context.SaveChangesAsync();
                            }
                            catch (Exception e)
                            {
                                //For dubugging
                                Console.WriteLine(e);
                                throw;
                            }

                            somethingSaved = true;
                        }
                        else
                        {
                            result.Success = false;
                            result.ErrorMessage.Add("Key Code missing. Line Ignored");
                        }

                        if (result.Success)
                        {
                            try
                            {
                                transaction.Commit();
                                keyCount += recKeyCount;
                                serialCount += recSerialCount;
                                peopleCount += recPeopleCount;
                                assignmentCount += recAssignmentCount;

                            }
                            catch (Exception e)
                            {
                                result.Success = false;
                                result.ErrorMessage.Add("There was a problem saving this record.");
                                errorCount += 1;
                            }

                        }
                        else
                        {
                            if (somethingSaved)
                            {
                                errorCount += 1;
                                transaction.Rollback();
                                if (!string.IsNullOrWhiteSpace(r.KerbUser))
                                {
                                    var local = _context.Set<User>()
                                        .Local
                                        .FirstOrDefault(entry => entry.Id.Equals(r.KerbUser));

                                    // check if local is not null 
                                    if (local != null) // I'm using a extension method
                                    {
                                        // detach
                                        _context.Entry(local).State = EntityState.Detached;
                                    }

                                    var localPerson = _context.Set<Person>().Local
                                        .FirstOrDefault(entry => entry.UserId.Equals(r.KerbUser));
                                    if (localPerson != null) // I'm using a extension method
                                    {
                                        // detach
                                        _context.Entry(localPerson).State = EntityState.Detached;
                                    }

                                }
                            }
                        }

                        if (!result.Success)
                        {
                            result.Messages = new List<string>();
                        }
                        resultsView.Add(result);
                    }
                }
            }

            Message = $"Successfully loaded {keyCount} new keys, {serialCount} new keySerials, {peopleCount} new or reactivated team members, and {assignmentCount} new assignments recorded.";
            if (errorCount > 0)
            {
                ErrorMessage = $"{errorCount} rows not imported due to errors.";
            }
            return View(resultsView);

        }

        public IActionResult UploadEquipment()
        {
            var model = new List<EquipmentImportResults>();
            return View(model);

        }

        [HttpPost]
        public async Task<IActionResult> UploadEquipment(IFormFile file)
        {
            var resultsView = new List<EquipmentImportResults>();

            var userIdentity = User.Identity.Name;
            var userName = User.GetNameClaim();
            var equipmentAttribute = new EquipmentAttribute();

            var equipmentCount = 0;
            var peopleCount = 0;
            var assignmentCount = 0;
            var errorCount = 0;
            var rowNumber = 1;
            bool import = true;
            bool somethingSaved = false;

            if (file == null || file.Length == 0)
            {
                Message = "File not selected";
                return RedirectToAction("Upload");
            }

            // Add counts
            var team = await _context.Teams.FirstAsync(t => t.Slug == Team);
            //Load up the available keys so we get once.
            var teamKeys = await _context.EquipmentAttributeKeys.Where(a => a.TeamId == null || a.TeamId == team.Id).ToListAsync();

            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader))
            {
                csv.Configuration.PrepareHeaderForMatch = (string header, int index) => header.ToLower().Replace(" ", string.Empty);
                var record = new EquipmentImport();
                var records = csv.EnumerateRecords(record);
                try
                {
                    csv.Read();
                    csv.ReadHeader();
                    csv.ValidateHeader(typeof(EquipmentImport));
                }
                catch (HeaderValidationException e)
                {
                    var firstSentence = e.Message.Split('.');
                    ErrorMessage = firstSentence.FirstOrDefault() ?? "Error Detected";
                    return View();
                }
                
                foreach (var r in records)
                {

                    var recEquipmentCount = 0;
                    var recPeopleCount = 0;
                    var recAssignmentCount = 0;

                    using (var transaction = await _context.Database.BeginTransactionAsync())
                    {
                        somethingSaved = false;
                        rowNumber += 1;
                        var result = new EquipmentImportResults(r)
                        {
                            LineNumber = rowNumber,
                            Success = true
                        };
                        ModelState.Clear();
                        Person person = null;

                        var equipment = CreateEquipment(r, team, result, ref recEquipmentCount);
                        if (result.Success)
                        {
                            AddEquipmentAttributes(r, equipment, result, teamKeys);
                        }

                        if (result.Success)
                        {
                            var personResult = await GetCreatePerson(r, team, result, userName, userIdentity, "CSV Import -- Equipment");
                            recPeopleCount = personResult.recPeopleCount;
                            person = personResult.person;
                        }

                        if (result.Success)
                        {
                            recAssignmentCount = await AddEquipmentAssignment(r, person, userIdentity, userName, equipment, result);
                        }
                        
                        try
                        {
                            await _context.SaveChangesAsync();
                        }
                        catch (Exception e)
                        {
                            //For dubugging
                            Console.WriteLine(e);
                            throw;
                        }
                        somethingSaved = true;

                        if (result.Success)
                        {
                            try
                            {
                                transaction.Commit();
                                equipmentCount += recEquipmentCount;
                                peopleCount += recPeopleCount;
                                assignmentCount += recAssignmentCount;
                            }
                            catch (Exception e)
                            {
                                result.Success = false;
                                result.ErrorMessage.Add("There was a problem saving this record.");
                                errorCount += 1;
                            }

                        }
                        else
                        {
                            if (somethingSaved)
                            {
                                errorCount += 1;
                                transaction.Rollback();
                                if (!string.IsNullOrWhiteSpace(r.KerbUser))
                                {
                                    var local = _context.Set<User>()
                                        .Local
                                        .FirstOrDefault(entry => entry.Id.Equals(r.KerbUser));

                                    // check if local is not null 
                                    if (local != null) // I'm using a extension method
                                    {
                                        // detach
                                        _context.Entry(local).State = EntityState.Detached;
                                    }

                                    var localPerson = _context.Set<Person>().Local
                                        .FirstOrDefault(entry => entry.UserId.Equals(r.KerbUser));
                                    if (localPerson != null) // I'm using a extension method
                                    {
                                        // detach
                                        _context.Entry(localPerson).State = EntityState.Detached;
                                    }
                                }
                            }
                        }

                        if (!result.Success)
                        {
                            result.Messages = new List<string>();
                        }
                        resultsView.Add(result);
                    }
                }
            }

            Message = $"Successfully loaded {equipmentCount} new items, {peopleCount} new or reactivated team members, and {assignmentCount} new assignments recorded.";
            if (errorCount > 0)
            {
                ErrorMessage = $"{errorCount} rows not imported due to errors.";
            }
            return View(resultsView);

        }

        private static string SetStatus(string status, KeyImportResults result)
        {
            if (!string.IsNullOrWhiteSpace(status) && KeySerialStatusModel.StatusList.Contains(status.Trim(), StringComparer.OrdinalIgnoreCase))
            {
                return KeySerialStatusModel.StatusList.Single(a => a.Equals(status.Trim(), StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                result.Messages.Add("Key status defaulted to Active.");
                return ("Active");
            }
        }

        private void CreateAttribute(Equipment equipment, string key, string value, EquipmentImportResults result, ref int recAttributeCount, ref bool recAttributeAdded, List<EquipmentAttributeKey> teamKeys)
        {
            var equipmentAttribute = new EquipmentAttribute();
            equipmentAttribute.Equipment = equipment;
            var foundKey = teamKeys.FirstOrDefault(a => a.Key.Equals(key.Trim(), StringComparison.OrdinalIgnoreCase));
            if (foundKey != null)
            {
                equipmentAttribute.Key = foundKey.Key;
                if (foundKey.Key != key)
                {
                    result.Messages.Add($"Warning, Key: {key} was adjusted to: {foundKey.Key}.");
                }
            }
            else
            {
                equipmentAttribute.Key = key;
                result.Messages.Add($"Warning, Key: {key} not found in valid choices.");
            }
            
            equipmentAttribute.Value = value;
            ModelState.Clear();
            TryValidateModel(equipmentAttribute);
            if (ModelState.IsValid)
            {
                _context.EquipmentAttributes.Add(equipmentAttribute);
                recAttributeCount += 1;
                recAttributeAdded = true;
            }
            else
            {
                result.Success = false;
                result.ErrorMessage.Add($"Invalid Equipment Attribute values Error(s): {GetModelErrors(ModelState)} ");
            }
        }

        private Equipment CreateEquipment(EquipmentImport r, Team team, EquipmentImportResults result, ref int recEquipmentCount)
        {
            var equipment = new Equipment();
            if (!string.IsNullOrWhiteSpace(r.EquipmentName))
            {                
                equipment.Name = r.EquipmentName;
                equipment.SerialNumber = r.SerialNumber;
                equipment.Make = r.Make;
                equipment.Model = r.Model;
                equipment.Tags = string.IsNullOrWhiteSpace(r.Tag) ? "Imported" : $"{r.Tag},Imported";
                equipment.TeamId = team.Id;
                equipment.Notes = r.Notes;
                equipment.SystemManagementId = r.BigfixId;

                ModelState.Clear();
                TryValidateModel(equipment);
                if (string.IsNullOrWhiteSpace(r.Type))
                {
                    equipment.Type = EquipmentTypes.Default;
                }
                else
                {
                    if (EquipmentTypes.Types.Contains(r.Type.Trim(), StringComparer.OrdinalIgnoreCase))
                    {
                        equipment.Type = EquipmentTypes.Types.Single(a => a.Equals(r.Type.Trim(), StringComparison.OrdinalIgnoreCase));
                    }
                    else
                    {
                        ModelState.AddModelError("Type", "Invalid Equipment Type");
                    }
                }

                if (EquipmentTypes.Is3Types.Contains(equipment.Type, StringComparer.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrWhiteSpace(r.ProtectionLevel) && EquipmentProtectionLevels.Levels.Contains(r.ProtectionLevel.Trim(), StringComparer.OrdinalIgnoreCase))
                    {
                        equipment.ProtectionLevel = EquipmentProtectionLevels.Levels.Single(a => a.Equals(r.ProtectionLevel.Trim(), StringComparison.OrdinalIgnoreCase));
                    }
                    else 
                    {
                        result.Success = false;
                        result.ErrorMessage.Add("Invalid Protection Level Value.");
                        return equipment;
                    }
                    if (!string.IsNullOrWhiteSpace(r.AvailabilityLevel) && EquipmentAvailabilityLevels.Levels.Contains(r.AvailabilityLevel.Trim(), StringComparer.OrdinalIgnoreCase))
                    {
                        equipment.AvailabilityLevel = EquipmentAvailabilityLevels.Levels.Single(a => a.Equals(r.AvailabilityLevel.Trim(), StringComparison.OrdinalIgnoreCase));
                    }
                    else
                    {
                        result.Success = false;
                        result.ErrorMessage.Add("Invalid Availability Level Value.");
                        return equipment;
                    }
                }
                
                
                if (ModelState.IsValid)
                {
                    _context.Equipment.Add(equipment);
                    recEquipmentCount += 1;
                    result.Messages.Add("Equipment Added.");
                }
                else
                {
                    result.Success = false;
                    result.ErrorMessage.Add($"Invalid Equipment values Error(s): {GetModelErrors(ModelState)} ");
                    return equipment;
                }
            }
            else
            {
                result.Success = false;
                result.ErrorMessage.Add("Equipment Name not provided. Line Ignored");
            }
            return equipment;
        }

        private void AddEquipmentAttributes(EquipmentImport r, Equipment equipment, EquipmentImportResults result, List<EquipmentAttributeKey> teamKeys)
        {
            var recAttributeCount = 0;
            var recAttributeAdded = false;
            if (!string.IsNullOrWhiteSpace(r.Key1) && result.Success)
            {
                CreateAttribute(equipment, r.Key1, r.Value1, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key2) && result.Success)
            {
                CreateAttribute(equipment, r.Key2, r.Value2, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key3) && result.Success)
            {
                CreateAttribute(equipment, r.Key3, r.Value3, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key4) && result.Success)
            {
                CreateAttribute(equipment, r.Key4, r.Value4, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key5) && result.Success)
            {
                CreateAttribute(equipment, r.Key5, r.Value5, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key6) && result.Success)
            {
                CreateAttribute(equipment, r.Key6, r.Value6, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key7) && result.Success)
            {
                CreateAttribute(equipment, r.Key7, r.Value7, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key8) && result.Success)
            {
                CreateAttribute(equipment, r.Key8, r.Value8, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key9) && result.Success)
            {
                CreateAttribute(equipment, r.Key9, r.Value9, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key10) && result.Success)
            {
                CreateAttribute(equipment, r.Key10, r.Value10, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key11) && result.Success)
            {
                CreateAttribute(equipment, r.Key11, r.Value11, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }
            if (!string.IsNullOrWhiteSpace(r.Key12) && result.Success)
            {
                CreateAttribute(equipment, r.Key12, r.Value12, result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
            }

            if (!string.IsNullOrWhiteSpace(r.GenericKeyValues) && result.Success)
            {
                var pairs = r.GenericKeyValues.Split(',');
                foreach (var pair in pairs)
                {
                    var kv = pair.Split("=");
                    if (kv.Length != 2)
                    {
                        result.Messages.Add($"Error Parsing GenericKeyValues: {pair}");
                    }
                    else
                    {
                        CreateAttribute(equipment, kv[0], kv[1], result, ref recAttributeCount, ref recAttributeAdded, teamKeys);
                    }
                }
                
            }

            if (recAttributeAdded)
            {
                result.Messages.Add($"{recAttributeCount} Attribute(s) Added.");
            }
        }

        private async Task<(int recPeopleCount, Person person)> GetCreatePerson(EquipmentImport r, Team team, EquipmentImportResults result, string actorName, string actorId, string notes)
        {
            Person person = null;
            int recPeopleCount = 0;
            if (!string.IsNullOrWhiteSpace(r.KerbUser))
            {
                try
                {
                    var personResult = await _identityService.GetOrCreatePersonFromKerberos(r.KerbUser, team.Id, team, actorName, actorId, notes);
                    recPeopleCount += personResult.peopleCount;
                    person = personResult.Person;
                }
                catch (Exception)
                {
                    person = null;
                    result.Success = false;
                    result.ErrorMessage.Add($"!!!!!!!!!!!!!THERE IS A PROBLEM WITH KerbUser {r.KerbUser} PLEASE CONTACT PEAKS HELP with this User ID.!!!!!!!!!!!!!!!");
                }

                if (person == null)
                {
                    result.Success = false;
                    result.ErrorMessage.Add($"KerbUser not found.");
                }
            }          

            return (recPeopleCount, person);

        }

        private async Task<int> AddEquipmentAssignment(EquipmentImport r, Person person, String userIdentity, String userName, Equipment equipment, EquipmentImportResults result)
        {
            int recAssignmentCount = 0;
            if(person == null)
            {
                return recAssignmentCount;
            }
            ModelState.Clear();
            var assignment = new EquipmentAssignment();
            assignment.RequestedAt = r.DateIssued.HasValue && r.DateIssued < DateTime.Now ? r.DateIssued.Value.ToUniversalTime() : DateTime.Now.ToUniversalTime();
            if (r.DateDue.HasValue && r.DateDue.Value > DateTime.Now)
            {
                assignment.ExpiresAt = r.DateDue.Value.ToUniversalTime();
            }
            else
            {
                ModelState.AddModelError("DateDue", "DateDue value not supplied or not in the future.");
            }
            assignment.PersonId = person.Id;
            assignment.RequestedById = userIdentity;
            assignment.RequestedByName = userName;
            equipment.Assignment = assignment;

            TryValidateModel(assignment);
            if (ModelState.IsValid && result.Success)
            {
                _context.EquipmentAssignments.Add(assignment);
                await _context.SaveChangesAsync();
                equipment.Assignment = assignment;
                equipment.EquipmentAssignmentId = assignment.Id;
                recAssignmentCount += 1;
                result.Messages.Add($"Assignment to {person.Name} created.");
            }
            else
            {
                result.Success = false;
                result.ErrorMessage.Add($"Invalid Assignment values Error(s): {GetModelErrors(ModelState)} ");
            }
            return recAssignmentCount;
        }
    }
}
