using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class HomeViewModel
    {
        public bool PendingItems { get; set; }



        public static async Task<HomeViewModel> Create(ApplicationDbContext context, Person person)
        {   
            var viewModel = new HomeViewModel();
            var keys = await context.KeyAssignments.Where(s => s.Person == person && !s.IsConfirmed).AnyAsync();
            var equipment = await context.EquipmentAssignments.Where(e => e.Person == person && !e.IsConfirmed).AnyAsync();
            var workstations = await context.WorkstationAssignments.Where(w => w.Person == person && !w.IsConfirmed).AnyAsync();
            viewModel.PendingItems = keys || equipment || workstations;
            return viewModel;
        }

    }
}
