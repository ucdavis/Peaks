using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Models;
using Keas.Mvc.Models.ReportModels;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Services
{
    public interface IReportService
    {
        Task<IList<WorkstationReportModel>> WorkStations(Team team, string teamSlug);
        Task<List<FeedPeopleModel>> GetPeopleFeed(string teamSlug);
        List<FeedPeopleSpaceModel> GetPeopleFeedIncludeSpace(string teamSlug);
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
                AssignmentModel = !a.WorkstationAssignmentId.HasValue ? null : new WorkstationAssignmentReportModel
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
    }
}
