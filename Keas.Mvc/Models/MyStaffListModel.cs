using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;

namespace Keas.Mvc.Models
{
    public class MyStaffListModel
    {
        public List<Person> People { get; set; }

        public static async Task<MyStaffListModel> Create(ApplicationDbContext context, Person person)
        {   
            var viewModel = new MyStaffListModel
            {
                People = await context.People.Where(p => p.TeamId == person.TeamId && p.Active && p.SupervisorId == person.Id)
                    .Include(p => p.Team)
                    .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
                    .AsNoTracking().ToListAsync()
            };
            return viewModel;
        }

    }

    public class MyStaffListItem
    {
        public List<KeySerial> KeySerials { get; set; }
        public List<Equipment> Equipment { get; set; }
        public List<Access> Access { get; set; }
        public List<Workstation> Workstations { get; set; }
        public List<Document> Documents { get; set; }
        public Func<string, string> DocumentUrlResolver { get; set; }
        public List<History> Histories { get; set; }
        public bool PendingItems { get; set; }
        public IEnumerable<Team> TeamsWithPendingAssignments { get; set; }


        public static async Task<MyStaffListItem> Create(ApplicationDbContext context, Person person)
        {   
            var viewModel = new MyStaffListItem
            {
                KeySerials = await context.KeySerials.Include(s=> s.Key).ThenInclude(k=> k.KeyXSpaces).ThenInclude(kxp=> kxp.Space).Include(s=> s.KeySerialAssignment)
                    .Where(s=> s.KeySerialAssignment.Person==person).AsNoTracking().ToListAsync(),
                Equipment = await context.Equipment.Include(e => e.Space).Include(e=> e.Assignment).Where(e => e.Assignment.Person == person).AsNoTracking().ToListAsync(),
                Access = await context.Access
                    .Where(x => x.Active && x.Assignments.Any(y => y.Person == person))
                    .Select(a => new Access()
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Assignments = a.Assignments.Where(b => b.Person == person).Select(
                            c => new AccessAssignment()
                            {
                                AccessId = c.AccessId,
                                ExpiresAt = c.ExpiresAt,
                                Id = c.Id
                            }
                        ).ToList()
                    })
                    .AsNoTracking().ToListAsync(),
                Workstations = await context.Workstations.Include(w=> w.Assignment).Include(w=> w.Space).Where(w=> w.Assignment.Person==person).AsNoTracking().ToListAsync(),
                Documents = await context.Documents.Where(d => d.Person == person).AsNoTracking().ToListAsync(),
                Histories = await context.Histories.Where(x => x.Target == person)
                    .OrderByDescending(x => x.ActedDate)
                    .Take(10).AsNoTracking().ToListAsync()
            };

            return viewModel;
        }

    }
}
