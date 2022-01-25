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
        Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug);
        Task<IList<WorkstationReportModel>> WorkStations(Group group);
        Task<List<FeedPeopleModel>> GetPeopleFeed(string teamSlug);
        List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug);
        Task<IList<EquipmentReportModel>> EquipmentList(Team team, string teamSlug, bool hideInactive = true);
        Task<EquipmentHistoryModel> EquipmentHistory(Team team, string teamSlug, int equipmentId);
        Task<IList<EquipmentReportModel>> EquipmentList(Group group, bool hideInactive = true);
        Task<IList<AccessReportModel>> AccessList(Team team, string teamSlug);
        Task<IList<KeyReportModel>> Keys(Team team, string teamSlug, bool includeSerials = true, bool includeSpaces = true);
        Task<IList<KeyReportModel>> Keys(Group group, bool includeSerials = true, bool includeSpaces = true);

        Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Team team, string teamSlug);
        Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Group group);

        Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Team team, string teamSlug, DateTime theDate);
        Task<IList<PeopleLeavingWithAssetsModel>> PeopleLeavingWithAssets(Group group, DateTime theDate);
    }


    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
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
                    FullName = a.Assignment.Person.Name,
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

        public async Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            return await _context.Workstations.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(WorkstationProjection()).ToListAsync();

        }

        public async Task<IList<WorkstationReportModel>> WorkStations(Group group)
        {
            return await _context.Workstations.IgnoreQueryFilters().AsNoTracking().Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id)).Select(WorkstationProjection()).ToListAsync();
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
                    FullName = a.Assignment.Person.Name,
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
                    FullName = b.Person.Name,
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
                        FullName = b.KeySerialAssignment.Person.Name,
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
                    Name = s.Name,
                    Email = s.Email,
                    PersonId = s.Id,
                    IncompleteDocumentCount = s.Documents.Count(w => w.Active && w.Status != "Completed"),
                }).ToListAsync();


            return people;
        }

        public async Task<IList<IncompleteDocumentReportModel>> IncompleteDocuments(Group group)
        {
            var people = await _context.People.AsNoTracking().Include(a => a.Team).Include(a => a.Documents)
                .Where(a => a.Team.Groups.Any(g => g.GroupId == group.Id) && a.Documents.Any(x => x.Active && x.Status != "Completed"))
                .Select(s => new IncompleteDocumentReportModel()
                {
                    Name = s.Name,
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

    }
}
