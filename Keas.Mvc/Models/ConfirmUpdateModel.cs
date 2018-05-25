using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class ConfirmUpdateModel
    {
        public List<Key> Keys { get; set; }
        public List<Equipment> Equipment { get; set; }
        public List<Workstation> Workstations { get; set; }


        public static async Task<ConfirmUpdateModel> Create(ApplicationDbContext context,Person person)
        {
            var viewModel = new ConfirmUpdateModel
            {
                Keys = await context.Keys.Include(k => k.Assignment).Where(k => !k.Assignment.IsConfirmed && k.Assignment.Person==person).ToListAsync(),
                Equipment = await context.Equipment.Include(e => e.Assignment).Where(e => !e.Assignment.IsConfirmed && e.Assignment.Person == person).ToListAsync(),
                Workstations = await context.Workstations.Include(w=> w.Assignment).Where(w=> !w.Assignment.IsConfirmed && w.Assignment.Person==person).ToListAsync()
            };

            return viewModel;
        }
    }
}
