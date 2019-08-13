using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models.ReportModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Models;

namespace Keas.Mvc.Services
{
    public interface IReportService
    {
        Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug);
        Task<List<FeedPeopleModel>> GetPeopleFeed(string teamSlug);
        List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug);
        Task<IList<EquipmentReportModel>> EquipmentList(Team team, string teamSlug);
        Task<IList<AccessReportModel>> AccessList(Team team, string teamSlug);
        Task<IList<KeyReportModel>> Keys(Team team, string teamSlug, bool includeSerials = true, bool includeSpaces = true);
    }


    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }


        public async Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            return await _context.Workstations.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(a => new WorkstationReportModel
            {
                Name = a.Name,
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
            }).ToListAsync();

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

        public async Task<IList<EquipmentReportModel>> EquipmentList(Team team, string teamSlug)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var equipment = await _context.Equipment.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(a => new EquipmentReportModel
            {
                Name = a.Name,
                Type = string.IsNullOrWhiteSpace(a.Type) ? EquipmentTypes.Default : a.Type,
                ProtectionLevel = a.ProtectionLevel,
                AvailabilityLevel = a.AvailabilityLevel,
                BigfixId = a.BigfixId,
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
            }).ToListAsync();


            return equipment;
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

        public async Task<IList<KeyReportModel>> Keys(Team team, string teamSlug, bool includeSerials = true, bool includeSpaces = true)
        {
            if (team == null)
            {
                team = await _context.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var keys = await _context.Keys.IgnoreQueryFilters().AsNoTracking().Where(a => a.TeamId == team.Id).Select(a => new KeyReportModel()
            {
                KeyName = a.Name,
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
            }).ToListAsync();

            return keys;
        }
    }
}
