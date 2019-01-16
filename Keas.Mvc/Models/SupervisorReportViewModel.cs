using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class SupervisorReportViewModel
    {
        public List<Person> Supervisors { get; set; }  
        public Person[] Reports {get; set;} 

        [Display(Name = "Select supervisor")]
        public int PersonId {get; set;}

        public static async Task<SupervisorReportViewModel> Create(ApplicationDbContext context, string teamSlug, int selectedSupervisorId)
        {
            
            var supervisorIds = await context.People.Where(p => p.SupervisorId != null && p.Team.Slug == teamSlug).Select(i => i.SupervisorId).ToListAsync();          
            var supervisors = await context.People.Where(p => supervisorIds.Contains(p.Id)).ToListAsync();
            

            var reportingMembers = selectedSupervisorId == 0 ? null : await context.People.Where(p => p.SupervisorId == selectedSupervisorId && p.Team.Slug == teamSlug).ToArrayAsync();
           
            var viewModel = new SupervisorReportViewModel
            {
                Supervisors = supervisors,
                Reports = reportingMembers, 
                PersonId = selectedSupervisorId
            };
            viewModel.Supervisors.Insert(0, new Person{ Id = 0, FirstName = "--Select--"});
            return viewModel;
        }
    }
}
