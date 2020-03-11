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

        public IEnumerable<Team> TeamsWithPendingAssignments { get; set; }

        public static async Task<HomeViewModel> Create(ApplicationDbContext context, Person person)
        {   
            var viewModel = new HomeViewModel();
            if(person == null) 
            {
                viewModel.PendingItems = false;
                return viewModel;
            }

            var allPersons = await context.People.Where(a => a.Active && a.UserId == person.UserId).Select(a => a.Id).ToArrayAsync();

            var equipTeams = await context.EquipmentAssignments.Where(a => allPersons.Contains(a.PersonId) && !a.IsConfirmed)
                .Select(a => a.Person.Team).Distinct().ToListAsync();
            var keyTeams = await context.KeySerialAssignments.Where(a => allPersons.Contains(a.PersonId) && !a.IsConfirmed).Select(a => a.Person.Team).Distinct().ToListAsync();
            var workTeams = await context.WorkstationAssignments.Where(a => allPersons.Contains(a.PersonId) && !a.IsConfirmed).Select(a => a.Person.Team).Distinct().ToListAsync();

            viewModel.TeamsWithPendingAssignments = equipTeams.Union(keyTeams).Union(workTeams);
            viewModel.PendingItems = viewModel.TeamsWithPendingAssignments.Any();
            return viewModel;
        }

    }
}
