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
            var people = await _context.People
                .Where(x => x.Team.Slug == teamSlug && x.Active)
                .Select(p => new FeedPeopleModel
                {
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Name = p.Name,
                    Email = p.Email,
                    UserId = p.UserId,
                    Title = p.Title,
                    TeamPhone = p.TeamPhone,
                    Tags = p.Tags
                })
                .ToListAsync();

            return people;
        }

        public List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug)
        {
            var people = _context.People
                .Where(x => x.Team.Slug == teamSlug && x.Active)
                .Select(p => new FeedPeopleSpaceModel
                {
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Name = p.Name,
                    Email = p.Email,
                    UserId = p.UserId,
                    Title = p.Title,
                    TeamPhone = p.TeamPhone,
                    Tags = p.Tags,
                    Workstations = (from w in _context.Workstations where w.Assignment.PersonId == p.Id select w)
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
                }).ToArray(),
            }).ToListAsync();

            return access;
        }
    }
}
