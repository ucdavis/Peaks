using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class MyStuffListModel
    {
        public List<Serial> Serials { get; set; }
        public List<Equipment> Equipment { get; set; }
        public List<Access> Access { get; set; }
        public List<Workstation> Workstations { get; set; }
        public List<History> Histories { get; set; }
        public bool PendingItems { get; set; }



        public static async Task<MyStuffListModel> Create(ApplicationDbContext context, Person person)
        {   
            var viewModel = new MyStuffListModel
            {                
                Serials = await context.Serials.Include(s=> s.Key).ThenInclude(k=> k.KeyXSpaces).ThenInclude(kxp=> kxp.Space).Include(s=> s.Assignment)
                    .Where(s=> s.Assignment.Person==person).AsNoTracking().ToListAsync(),
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
                Histories = await context.Histories.Where(x => x.Target == person)
                    .OrderByDescending(x => x.ActedDate)
                    .Take(10).AsNoTracking().ToListAsync()
            };
            viewModel.PendingItems = viewModel.Serials.Where(s => !s.Assignment.IsConfirmed).Any() 
                                    || viewModel.Equipment.Where(e => !e.Assignment.IsConfirmed).Any() 
                                    || viewModel.Workstations.Where(w => !w.Assignment.IsConfirmed).Any() ;
            return viewModel;
        }

    }
}
