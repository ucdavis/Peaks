using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models.ReportModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;
using System;
using System.Globalization;
using System.Linq.Expressions;
using Dapper;
using Keas.Core.Extensions;

namespace Keas.Mvc.Services
{
    public interface IReportService
    {
        Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug, bool hideInactive = true);
        Task<IList<WorkstationReportModel>> WorkStations(Group group, bool hideInactive = true);
        Task<List<FeedPeopleModel>> GetPeopleFeed(string teamSlug);
        List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug);
        Task<IList<EquipmentReportModel>> EquipmentList(Team team, string teamSlug, bool hideInactive = true);
        Task<EquipmentHistoryModel> EquipmentHistory(Team team, string teamSlug, int equipmentId);
        Task<EquipmentHistoryModel> PersonEquipmentHistory(Team team, string teamSlug, int personId);
        Task<IList<EquipmentReportModel>> EquipmentList(Group group, bool hideInactive = true);
        Task<IList<AccessReportModel>> AccessList(Team team, string teamSlug);
        Task<IList<KeyReportModel>> Keys(Team team, string teamSlug, bool includeSerials = true, bool includeSpaces = true);
        Task<IList<KeyReportModel>> Keys(Group group, bool includeSerials = true, bool includeSpaces = true);

        Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Team team, string teamSlug);
        Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Group group);

        Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Team team, string teamSlug, DateTime theDate);
        Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Group group, DateTime theDate);

        Task<ReportItemsViewModel> ExpiringItems(Team team, string teamSlug, DateTime? expiresBefore = null, string showType = "All");
        Task<ReportItemsViewModel> ExpiringItems(Group group, DateTime? expiresBefore = null, string showType = "All");
        Task<List<InactiveSpaceReportModel>> InactiveSpaces(string teamSlug); //Not sure if this one can be done with a group

        Task<CompletedDocsReportModel> CompletedDocuments(Team team, string teamSlug, DateTime? start, DateTime? end);
    }


    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;

        public ReportService(ApplicationDbContext context, ISecurityService securityService)
        {
            _context = context;
            _securityService = securityService;
        }

        public Expression<Func<Workstation, WorkstationReportModel>> WorkstationProjection() {
            return a => new WorkstationReportModel
            {
                Name = a.Name,
                Team = a.Team.Slug,
                Notes = a.Notes,
                Tags = a.Tags,
                Active = a.Active,
                IsAssigned = a.WorkstationAssignmentId.HasValue,
                Assignment = !a.WorkstationAssignmentId.HasValue ? null : new AssignmentReportModel
                {
                    PersonId = a.Assignment.PersonId,
                    FirstName = a.Assignment.Person.FirstName,
                    LastName = a.Assignment.Person.LastName,
                    UserId = a.Assignment.Person.UserId,
                    Email = a.Assignment.Person.Email,
                    ExpiryDateTime = a.Assignment.ExpiresAt,
                    IsConfirmed = a.Assignment.IsConfirmed,
                    ConfirmedAt = a.Assignment.ConfirmedAt,
                },
                Space = new SpaceReportModel
                {
                    RoomNumber = a.Space.RoomNumber,
                    BldgName = a.Space.BldgName,
                    RoomName = a.Space.RoomName,
                    FloorName = a.Space.FloorName,
                    RoomCategoryName = a.Space.RoomCategoryName,
                    SqFt = a.Space.SqFt,
                },
            };
        }

        public async Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug, bool hideInactive = true)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var workstations = _context.Workstations.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(WorkstationProjection());
            if (hideInactive)
            {
                workstations = workstations.Where(a => a.Active);
            }


            return await workstations.ToListAsync();

        }

        public async Task<IList<WorkstationReportModel>> WorkStations(Group group, bool hideInactive = true)
        {

            var workstations = _context.Workstations.IgnoreQueryFilters().AsNoTracking().Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id)).Select(WorkstationProjection());
            if (hideInactive)
            {
                workstations = workstations.Where(a => a.Active);
            }

            return await workstations.ToListAsync();
        }

        public async Task<List<FeedPeopleModel>> GetPeopleFeed(string teamSlug)
        {
            var people = await _context.People.IgnoreQueryFilters().AsNoTracking()
                .Where(x => x.Team.Slug == teamSlug)
                .Select(p => new FeedPeopleModel
                {
                    Active = p.Active,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Name = p.Name,
                    Email = p.Email,
                    UserId = p.UserId,
                    Title = p.Title,
                    TeamPhone = p.TeamPhone,
                    HomePhone = p.HomePhone,
                    Tags = p.Tags,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Supervisor = p.Supervisor == null ? null : $"{p.Supervisor.Name} ({p.Supervisor.Email})",
                    Category = p.Category,
                    Notes = p.Notes,
                })
                .ToListAsync();

            return people;
        }

        public List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug)
        {
            var people = _context.People.IgnoreQueryFilters().AsNoTracking()
                .Where(x => x.Team.Slug == teamSlug)
                .Select(p => new FeedPeopleSpaceModel
                {
                    Active = p.Active,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Name = p.Name,
                    Email = p.Email,
                    UserId = p.UserId,
                    Title = p.Title,
                    TeamPhone = p.TeamPhone,
                    HomePhone = p.HomePhone,
                    Tags = p.Tags,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Supervisor = p.Supervisor == null ? null : $"{p.Supervisor.Name} ({p.Supervisor.Email})",
                    Category = p.Category,
                    Notes = p.Notes,
                    Workstations = (from w in _context.Workstations where w.Assignment.PersonId == p.Id && w.Active select w)
                        .Include(w => w.Space)
                        .Select(w => new FeedWorkstation
                        {
                            Name = w.Name,
                            BldgName = w.Space.BldgName,
                            RoomNumber = w.Space.RoomNumber
                        }).ToList()
                })
                .ToList();

            return people;
        }


        public Expression<Func<Equipment, EquipmentReportModel>> EquipmentProjection()
        {
            return a => new EquipmentReportModel
            {
                Name = a.Name,
                Team = a.Team.Slug,
                Type = string.IsNullOrWhiteSpace(a.Type) ? EquipmentTypes.Default : a.Type,
                ProtectionLevel = a.ProtectionLevel,
                AvailabilityLevel = a.AvailabilityLevel,
                SystemManagementId = a.SystemManagementId,
                SerialNumber = a.SerialNumber,
                Make = a.Make,
                Model = a.Model,
                Notes = a.Notes,
                Tags = a.Tags,
                Active = a.Active,
                HasSpace = a.SpaceId.HasValue,
                IsAssigned = a.EquipmentAssignmentId.HasValue,
                AttributeCount = a.Attributes.Count,
                Assignment = !a.EquipmentAssignmentId.HasValue ? null : new AssignmentReportModel
                {
                    PersonId = a.Assignment.PersonId,
                    FirstName = a.Assignment.Person.FirstName,
                    LastName = a.Assignment.Person.LastName,
                    UserId = a.Assignment.Person.UserId,
                    Email = a.Assignment.Person.Email,
                    ExpiryDateTime = a.Assignment.ExpiresAt,
                    IsConfirmed = a.Assignment.IsConfirmed,
                    ConfirmedAt = a.Assignment.ConfirmedAt,
                    RequestedAt = a.Assignment.RequestedAt,
                },
                Space = !a.SpaceId.HasValue ? null : new SpaceReportModel
                {
                    RoomNumber = a.Space.RoomNumber,
                    BldgName = a.Space.BldgName,
                    RoomName = a.Space.RoomName,
                    FloorName = a.Space.FloorName,
                    RoomCategoryName = a.Space.RoomCategoryName,
                    SqFt = a.Space.SqFt,
                },
                Attributes = a.Attributes.Count <= 0 ? null : a.Attributes.Select(b => new AttributeReportModel
                {
                    Key = b.Key,
                    Value = b.Value,
                }).ToArray(),
            };
        }

        public async Task<IList<EquipmentReportModel>> EquipmentList(Group group, bool hideInactive = true)
        {
            var equipment = _context.Equipment.IgnoreQueryFilters().AsNoTracking().Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id)).Select(EquipmentProjection());
            if (hideInactive)
            {
                equipment = equipment.Where(a => a.Active);
            }

            return await equipment.ToListAsync();
        }

        public async Task<IList<EquipmentReportModel>> EquipmentList(Team team, string teamSlug, bool hideInactive = true)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var equipment = _context.Equipment.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(EquipmentProjection());
            if (hideInactive)
            {
                equipment = equipment.Where(a => a.Active);
            }

            return await equipment.ToListAsync();
        }

        public async Task<EquipmentHistoryModel> EquipmentHistory(Team team, string teamSlug, int equipmentId)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var equipment = await _context.Equipment.AsNoTracking().SingleAsync(a => a.TeamId == team.Id && a.Id == equipmentId);
            var histories = await _context.Histories.Where(a => a.EquipmentId == equipment.Id).ToArrayAsync();

            return new EquipmentHistoryModel { Equipment = equipment, Histories = histories };
        }

        public async Task<EquipmentHistoryModel> PersonEquipmentHistory(Team team, string teamSlug, int personId)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }
            var person = await _context.People.AsNoTracking().SingleAsync(a => a.TeamId == team.Id && a.Id == personId);
            var histories = await _context.Histories.Where(a => a.TargetId == person.Id && a.AssetType == "Equipment").ToArrayAsync(); //Could instead check if the equipment id isn't null

            return new EquipmentHistoryModel { Person = person, Histories = histories };
        }

        public async Task<IList<AccessReportModel>> AccessList(Team team, string teamSlug)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var access = await _context.Access.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(a => new AccessReportModel
            {
                Name = a.Name,
                Notes = a.Notes,
                Tags = a.Tags,
                Active = a.Active,
                AssignmentCount = a.Assignments.Count,
                Assignments = a.Assignments.Count <= 0 ? null : a.Assignments.Select(b => new AssignmentReportModel
                {
                    PersonId = b.PersonId,
                    FirstName = b.Person.FirstName,
                    LastName = b.Person.LastName,
                    UserId = b.Person.UserId,
                    Email = b.Person.Email,
                    ExpiryDateTime = b.ExpiresAt,
                    IsConfirmed = b.IsConfirmed,
                    ConfirmedAt = b.ConfirmedAt,
                }).ToArray(),
            }).ToListAsync();

            return access;
        }

        public Expression<Func<Key, KeyReportModel>> KeysProjection(bool includeSerials = true, bool includeSpaces = true)
        {
            return a => new KeyReportModel()
            {
                KeyName = a.Name,
                Team = a.Team.Slug,
                Code = a.Code,
                Notes = a.Notes,
                Tags = a.Tags,
                Active = a.Active,
                KeySerialCount = a.Serials.Count,
                SpacesCount = a.KeyXSpaces.Count,
                Serials = a.Serials.Count <= 0 || !includeSerials ? null : a.Serials.Select(b => new KeySerialReportModel
                {
                    Active = b.Active,
                    SerialName = b.Name,
                    SerialNumber = b.Number,
                    Status = b.Status,
                    Notes = b.Notes,
                    IsAssigned = b.KeySerialAssignmentId.HasValue && b.KeySerialAssignment != null,
                    Assignment = !b.KeySerialAssignmentId.HasValue || b.KeySerialAssignment == null ? null : new AssignmentReportModel
                    {
                        PersonId = b.KeySerialAssignment.PersonId,
                        FirstName = b.KeySerialAssignment.Person.FirstName,
                        LastName = b.KeySerialAssignment.Person.LastName,
                        UserId = b.KeySerialAssignment.Person.UserId,
                        Email = b.KeySerialAssignment.Person.Email,
                        ExpiryDateTime = b.KeySerialAssignment.ExpiresAt,
                        IsConfirmed = b.KeySerialAssignment.IsConfirmed,
                        ConfirmedAt = b.KeySerialAssignment.ConfirmedAt,
                    },
                }).ToArray(),
                Spaces = a.KeyXSpaces.Count <= 0 || !includeSpaces ? null : a.KeyXSpaces.Select(c => new SpaceReportModel
                {
                    RoomNumber = c.Space.RoomNumber,
                    BldgName = c.Space.BldgName,
                    RoomName = c.Space.RoomName,
                    FloorName = c.Space.FloorName,
                    RoomCategoryName = c.Space.RoomCategoryName,
                    SqFt = c.Space.SqFt,
                }).ToArray(), 
            };
        }

        public async Task<IList<KeyReportModel>> Keys(Group group, bool includeSerials = true, bool includeSpaces = true)
        {
            return await _context.Keys.IgnoreQueryFilters().AsNoTracking().Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id)).Select(KeysProjection(includeSerials, includeSpaces)).ToListAsync();
        }

        public async Task<IList<KeyReportModel>> Keys(Team team, string teamSlug, bool includeSerials = true, bool includeSpaces = true)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            return await _context.Keys.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(KeysProjection(includeSerials, includeSpaces)).ToListAsync();
        }

        public async Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Team team, string teamSlug)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var people = await _context.People.AsNoTracking().Include(a => a.Documents)
                .Where(a => a.TeamId == team.Id && a.Documents.Any(x => x.Active && x.Status != "Completed"))
                .Select(s => new IncompleteDocumentReportModel()
                {
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.Email,
                    PersonId = s.Id,
                    IncompleteDocumentCount = s.Documents.Count(w => w.Active && w.Status != "Completed"),
                }).ToListAsync();


            return people;
        }

        public async Task<CompletedDocsReportModel> CompletedDocuments(Team team, string teamSlug, DateTime? start = null, DateTime? end = null)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }
            if (!start.HasValue)
            {
                start = DateTime.UtcNow.AddDays(-30).Date;
            }
            else
            {
                start = start.Value.FromPacificTime().Date;
            }
            if (!end.HasValue)
            {
                end = DateTime.UtcNow.AddDays(1).Date;
            }
            else
            {
                end = end.Value.FromPacificTime().Date;
            }

            var docs = await _context.Documents.AsNoTracking().Include(a => a.Person).Where(a => a.TeamId == team.Id && a.Active && a.Person.Active && a.CreatedAt >= start && a.CreatedAt <= end && a.Status == "Completed").ToListAsync();

            var model = new CompletedDocsReportModel { Start = start.Value.ToPacificTime().Date, End = end.Value.ToPacificTime().Date, Docs = docs };

            return model;
        }

        public async Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Group group)
        {
            var people = await _context.People.AsNoTracking().Include(a => a.Team).Include(a => a.Documents)
                .Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id) && a.Documents.Any(x => x.Active && x.Status != "Completed"))
                .Select(s => new IncompleteDocumentReportModel()
                {
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.Email,
                    PersonId = s.Id,
                    IncompleteDocumentCount = s.Documents.Count(w => w.Active && w.Status != "Completed"),
                    TeamName = s.Team.Name,
                    TeamSlug = s.Team.Slug,
                }).ToListAsync();


            return people;
        }

        public async Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Team team, string teamSlug, DateTime theDate)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }
            var teamId = team.Id;
            var enddate = theDate.Format("yyyy-MM-dd");

            var sql = PeopleQueries.PeopleLeavingWithAssets;
            
            var result = await _context.Database.GetDbConnection().QueryAsync(sql, new {enddate = enddate, teamId});
            
            var rtValue =  result.Select(r => new PeopleLeavingWithAssetsModel
            {
                Id = r.Id,
                Active = r.Active,
                FirstName = r.FirstName,
                LastName = r.LastName,
                Email = r.Email,
                Slug = r.Slug,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                EquipmentCount = r.EquipmentCount,
                AccessCount = r.AccessCount,
                KeyCount = r.KeyCount,
                WorkstationCount = r.WorkstationCount,
                Category = r.Category,
                SupervisorFirstName = r.SupervisorFirstName,
                SupervisorLastName = r.SupervisorLastName,
                SupervisorEmail = r.SupervisorEmail,
            }).ToList();

            return rtValue;
        }

        public async Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Group group, DateTime theDate)
        {
            var teamIds = group.Teams.Select(a => a.Team.Id).ToArray();

            var enddate = theDate.Format("yyyy-MM-dd");

            var sql = PeopleQueries.PeopleLeavingWithAssetsInGroup;

            var result = await _context.Database.GetDbConnection().QueryAsync(sql, new { enddate = enddate, teamIds = teamIds });

            var rtValue = result.Select(r => new PeopleLeavingWithAssetsModel
            {
                Id = r.Id,
                Active = r.Active,
                FirstName = r.FirstName,
                LastName = r.LastName,
                Email = r.Email,
                Slug = r.Slug,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                EquipmentCount = r.EquipmentCount,
                AccessCount = r.AccessCount,
                KeyCount = r.KeyCount,
                WorkstationCount = r.WorkstationCount,
                Category = r.Category,
                SupervisorFirstName = r.SupervisorFirstName,
                SupervisorLastName = r.SupervisorLastName,
                SupervisorEmail = r.SupervisorEmail,
            }).ToList();

            return rtValue;
        }

        public async Task<List<InactiveSpaceReportModel>> InactiveSpaces(string teamSlug)
        {

            var teamId = await _context.Teams.Where(a => a.Slug == teamSlug).Select(s => s.Id).SingleAsync();

            var sql = SpaceQueries.Inactive;

            var result = _context.Database.GetDbConnection().Query(sql, new { teamId });


            var spaces = result.Select(a => new InactiveSpaceReportModel
            {
                TeamSlug = teamSlug,
                DetailsLink = $"/{teamSlug}/spaces/details/{a.Id}",
                Room = $"{a.RoomNumber} {a.BldgName}",
                RoomName = a.RoomName,
                EquipmentCount = a.EquipmentCount,
                KeyCount = a.KeyCount,
                WorkStationCount = a.WorkstationsTotalCount       
            }).ToList();

            return spaces;
        }

        private string removeDuplications(string tags)
        {
            return !string.IsNullOrWhiteSpace(tags) ? string.Join(",", tags.ToString().Split(',').Distinct().ToArray()) : "";
        }

        public async Task<ReportItemsViewModel> ExpiringItems(Team team, string teamSlug, DateTime? expiresBefore, string showType)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }

            var userRoles = await _securityService.GetUserRoleNamesInTeamOrAdmin(team.Slug);

            //TODO: Replace this method with the projections as we don't need all the data. Would need to modify the view too
            var model = await ReportItemsViewModel.CreateExpiry(_context, expiresBefore.Value, team.Slug, showType, userRoles, _securityService);
            return model;
        }

        public async Task<ReportItemsViewModel> ExpiringItems(Group group, DateTime? expiresBefore, string showType)
        {
            if (expiresBefore == null)
            {
                expiresBefore = DateTime.Now.AddDays(30);
            }

            //This is a group report, just give access to all
            var model = new ReportItemsViewModel();
            model.ItemList = new List<string>() { "All" };
            model.ItemList.Add("Access");
            model.ItemList.Add("Equipment");
            model.ItemList.Add("Key");
            model.ItemList.Add("Workstation");
            model.ShowType = showType;
            model.ExpiresBefore = expiresBefore.Value;

            model.ExpiringItems = new List<ExpiringItemReportModel>();


            model.ExpiringItems.AddRange(await _context.AccessAssignments.Where(a => (showType == "All" || showType == "Access") &&
                a.Access.Team.Groups.Any(g => g.GroupId == group.Id) && a.ExpiresAt <= expiresBefore && a.Access.Active).IgnoreQueryFilters()
                .Select(ExpiringAccessProjection()).ToArrayAsync());

            model.ExpiringItems.AddRange(await _context.KeySerials.Where(a => (showType == "All" || showType == "Key") &&
                a.Key.Team.Groups.Any(g => g.GroupId == group.Id) &&
                a.KeySerialAssignment.ExpiresAt <= expiresBefore && a.Active).IgnoreQueryFilters()
                .Select(ExpiringKeysProjection()).ToArrayAsync());

            model.ExpiringItems.AddRange(await _context.Equipment.Where(a => (showType == "All" || showType == "Equipment") &&
                a.Team.Groups.Any(g => g.GroupId == group.Id) &&
                a.Assignment.ExpiresAt <= expiresBefore && a.Active).IgnoreQueryFilters()
                .Select(ExpiringEquipmentProjection()).ToArrayAsync());

            model.ExpiringItems.AddRange(await _context.Workstations.Where(a => (showType == "All" || showType == "Workstation") &&
                a.Team.Groups.Any(g => g.GroupId == group.Id) &&
                a.Assignment.ExpiresAt <= expiresBefore && a.Active).IgnoreQueryFilters()
                .Select(ExpiringWorkstationProjection()).ToArrayAsync());

            return model;
        }

        public Expression<Func<AccessAssignment, ExpiringItemReportModel>> ExpiringAccessProjection()
        {
            return a => new ExpiringItemReportModel
            {
                Type = "Access",
                ItemName = a.Access.Name,
                PersonName = a.Person != null ? $"{a.Person.LastName}, {a.Person.FirstName}" : $"Missing Person: {a.Id}",
                PersonActive = a.Person.Active,
                ExpiresAt = a.ExpiresAt.ToPacificTime(),
                TeamSlug = a.Access.Team.Slug,
                DetailsLink = $"/{a.Access.Team.Slug}/access/details/{a.AccessId}", //This is really only needed for the non group one?
            };
        }

        public Expression<Func<KeySerial, ExpiringItemReportModel>> ExpiringKeysProjection()
        {
            return a => new ExpiringItemReportModel
            {
                Type = "Key",
                ItemName = $"{a.Key.Name} {a.Key.Code}-{a.Number}",
                PersonName = a.KeySerialAssignment.Person != null ? $"{a.KeySerialAssignment.Person.LastName}, {a.KeySerialAssignment.Person.FirstName}" 
                    : $"Missing Person {a.KeySerialAssignment.Id}",
                PersonActive = a.KeySerialAssignment.Person.Active,
                ExpiresAt = a.KeySerialAssignment.ExpiresAt.ToPacificTime(),
                TeamSlug = a.Team.Slug,
                DetailsLink = $"/{a.Team.Slug}/keys/details/{a.KeyId}/keyserials/details/{a.KeySerialAssignment.KeySerialId}", //This is really only needed for the non group one?
            };
        }
        public Expression<Func<Equipment, ExpiringItemReportModel>> ExpiringEquipmentProjection()
        {
            return a => new ExpiringItemReportModel
            {
                Type = "Equipment",
                ItemName = a.Name,
                PersonName = a.Assignment.Person != null ? $"{a.Assignment.Person.LastName}, {a.Assignment.Person.FirstName}" : $"Missing Person: {a.Assignment.Id}",
                PersonActive = a.Assignment.Person.Active,
                ExpiresAt = a.Assignment.ExpiresAt.ToPacificTime(),
                TeamSlug = a.Team.Slug,
                DetailsLink = $"/{a.Team.Slug}/equipment/details/{a.Id}", //This is really only needed for the non group one?
            };
        }

        public Expression<Func<Workstation, ExpiringItemReportModel>> ExpiringWorkstationProjection()
        {
            return a => new ExpiringItemReportModel
            {
                Type = "Workstation",
                ItemName = a.Name,
                PersonName = a.Assignment.Person != null ? $"{a.Assignment.Person.LastName}, {a.Assignment.Person.FirstName}" : $"Missing Person: {a.Assignment.Id}",
                PersonActive = a.Assignment.Person.Active,
                ExpiresAt = a.Assignment.ExpiresAt.ToPacificTime(),
                TeamSlug = a.Team.Slug,
                DetailsLink = $"/{a.Team.Slug}/spaces/details/{a.SpaceId}", //This is really only needed for the non group one?
            };
        }
    }
}
