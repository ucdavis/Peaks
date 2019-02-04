using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;
using System.IO;
using CsvHelper;
using Microsoft.AspNetCore.Http;
using System.Text;

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

        public TeamAdminController(ApplicationDbContext context, IIdentityService identityService, IUserService userService, IFinancialService financialService)
        {
            _context = context;
            _identityService = identityService;
            _userService = userService;
            _financialService = financialService;
        }

        public async Task<IActionResult> Index()
        {
            var team = await _context.Teams
                .Include(o => o.FISOrgs)
                .Include(i => i.PpsDepartments)
                .SingleOrDefaultAsync(x => x.Slug == Team);

            return View(team);
        }

        public IActionResult AddFISOrg()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddFISOrg(FISOrgAddModel model)
        {
            model.OrgCode = model.OrgCode.ToUpper();
            var team = await _context.Teams.SingleOrDefaultAsync(x => x.Slug == Team);
            if (team == null)
            {
                return NotFound();
            }
            if (!await _financialService.ValidateFISOrg(model.Chart, model.OrgCode))
            {
                ModelState.AddModelError("OrgCode", "Chart and OrgCode are not valid");
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

            // Check if already Team Person. Add if not.
            var person = await _context.People.SingleOrDefaultAsync(p => p.UserId == user.Id && p.TeamId == team.Id);
            if (person == null)
            {
                person = new Person();
                person.TeamId = team.Id;
                person.UserId = user.Id;
                person.FirstName = user.FirstName;
                person.LastName = user.LastName;
                person.Email = user.Email;
                _context.People.Add(person);
                await _context.SaveChangesAsync();
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

            foreach (var role in roles)
            {
                var teamPermssionToDelete = _context.TeamPermissions.Single(tptd => tptd.RoleId == role && tptd.UserId == userId && tptd.Team.Slug == Team);
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

            foreach (var teamPpsDepartment in team.PpsDepartments)
            {
                Message = $"{await _identityService.BulkLoadPeople(teamPpsDepartment.PpsDepartmentCode, Team)} for {teamPpsDepartment.DepartmentName}. {Message}";
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

        public IActionResult Upload()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> UploadCSV(IFormFile file)
        {
            var keyCount = 0;
            var serialCount = 0;
            var peopleCount = 0;
            var assignmentCount = 0;
            var rowNumber = 0;
            StringBuilder warning = new StringBuilder();

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
                foreach (var r in records)
                {
                    rowNumber += 1;
                    if (!string.IsNullOrWhiteSpace(r.Keynumber))
                    {
                        var key = await _context.Keys.Where(k => k.Team.Slug == Team).SingleOrDefaultAsync(k => k.Code.ToUpper() == r.Keynumber.ToUpper());
                        if (key == null)
                        {
                            key = new Key();
                            key.Code = r.Keynumber.ToUpper();
                            key.TeamId = team.Id;
                            key.Name = r.Description;

                            TryValidateModel(key);
                            if (ModelState.IsValid)
                            {
                                _context.Keys.Add(key);
                                keyCount += 1;
                            }
                            else
                            {
                                warning.Append(String.Format("Could not save key in line {0} | ", rowNumber));
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(r.SerialNumber))
                        {
                            var serial = await _context.KeySerials.Where(s => s.KeyId == key.Id).SingleOrDefaultAsync(s => s.Number.ToUpper() == r.SerialNumber.ToUpper());
                            if (serial == null)
                            {
                                serial = new KeySerial();
                                serial.Number = r.SerialNumber;
                                serial.Name = r.SerialNumber;
                                serial.Key = key;
                                switch (r.Status) {                                    
                                    case "Lost" :
                                        serial.Status = "Lost";
                                        break;
                                    case "Destroyed" :
                                        serial.Status = "Destroyed";
                                        break;
                                    default:
                                        serial.Status = "Active";
                                        break;
                                }
                                serial.TeamId = team.Id;

                                TryValidateModel(serial);
                                if (ModelState.IsValid)
                                {
                                    _context.KeySerials.Add(serial);
                                    serialCount += 1;
                                }
                                else
                                {
                                    warning.Append(String.Format("Could not save serial in line {0} | ", rowNumber));
                                }

                            }

                            if (!string.IsNullOrWhiteSpace(r.KerbUser))
                            {
                                if (!string.IsNullOrWhiteSpace(r.KerbUser))
                                {
                                    var person = await _context.People.SingleOrDefaultAsync(p => p.TeamId == team.Id && p.UserId == r.KerbUser);
                                    if (person == null)
                                    {
                                        // Person doesn't exist. Check for user
                                        var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == r.KerbUser);
                                        if (user == null)
                                        {
                                            // No existing user
                                            user = await _identityService.GetByKerberos(r.KerbUser);
                                            if (user != null)
                                            {
                                                // IAM found user by Kerb
                                                _context.Users.Add(user);
                                            }
                                            else
                                            {
                                                // No user found, skip this assignment
                                                continue;
                                            }
                                        }
                                        person = new Person();
                                        person.User = user;
                                        person.FirstName = user.FirstName;
                                        person.LastName = user.LastName;
                                        person.Email = user.Email;
                                        person.Active = true;
                                        person.TeamId = team.Id;

                                        TryValidateModel(person);
                                        if (ModelState.IsValid)
                                        {
                                            _context.People.Add(person);
                                            peopleCount += 1;
                                        }
                                        else
                                        {
                                            warning.Append(String.Format("Could not save person in line {0} | ", rowNumber));
                                        }                                        
                                        
                                    }

                                    var assignment = await _context.KeySerialAssignments.SingleOrDefaultAsync(a => a.KeySerialId == serial.Id);
                                    if (assignment == null)
                                    {
                                        assignment = new KeySerialAssignment();
                                        if(r.DateIssued.HasValue && r.DateIssued < DateTime.Now) 
                                        {
                                             assignment.RequestedAt = r.DateIssued.Value.ToUniversalTime();
                                        }
                                        if(r.DateDue.HasValue && r.DateDue.Value > DateTime.Now)
                                        {
                                          assignment.ExpiresAt = r.DateDue.Value.ToUniversalTime();  
                                        }
                                        assignment.PersonId = person.Id;
                                        assignment.KeySerialId = serial.Id;

                                        TryValidateModel(assignment);
                                        if (ModelState.IsValid)
                                        {
                                            _context.KeySerialAssignments.Add(assignment);
                                            assignmentCount += 1;
                                        }
                                        else
                                        {
                                            warning.Append(String.Format("Could not save assignment in line {0} | ", rowNumber));
                                        }                                         
                                    }
                                    assignment.RequestedAt = r.DateIssued;
                                    assignment.ExpiresAt = r.DateDue;
                                    assignment.PersonId = person.Id;
                                    assignment.KeySerialId = serial.Id;
                                }
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }
            Message = string.Format("Successfully loaded {0} new keys, {1} new keySerials, {2} new team members, and {3} new assignments recorded. {4}", keyCount, serialCount, peopleCount, assignmentCount, warning.ToString());
            return RedirectToAction("Index");

        }

    }
}
