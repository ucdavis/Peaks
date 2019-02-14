using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class ConfirmListModel
    {
        public List<KeySerial> KeySerials { get; set; }
        public List<Equipment> Equipment { get; set; }
        public List<Workstation> Workstations { get; set; }

       
        public static async Task<ConfirmListModel> Create(ApplicationDbContext context, Person person)
        {
            var viewModel = new ConfirmListModel
            {
                KeySerials = await context.KeySerials.Include(s=> s.Key).Include(s => s.KeySerialAssignment).Where(s=> !s.KeySerialAssignment.IsConfirmed && s.KeySerialAssignment.Person== person).AsNoTracking().ToListAsync(),
                Equipment = await context.Equipment.Include(e=> e.Space).Where(e => !e.Assignment.IsConfirmed && e.Assignment.Person==person).AsNoTracking().ToListAsync(),
                Workstations = await context.Workstations.Include(w=> w.Space).Where(w=> !w.Assignment.IsConfirmed && w.Assignment.Person==person).AsNoTracking().ToListAsync()
            };
            
            return viewModel;
        }

    }
}
