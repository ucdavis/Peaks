using Keas.Core.Domain;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class TeamAdminMembersAddModel
    {
        public Team Team { get; set; }

        [Display(Name = "Role to Add")]
        public int RoleId { get; set; }

        public string UserEmail { get; set; }

        public List<Role> Roles { get; set; }

        public static async Task<TeamAdminMembersAddModel> Create(Team team, ApplicationDbContext context)
        {

            var viewModel = new TeamAdminMembersAddModel
            {
                Team = team,
                Roles = await context.Roles.Where(r=> !r.IsAdmin).OrderBy(x => x.Name).ToListAsync(),
            };

            viewModel.Roles.Insert(0, new Role{ Id = 0, Name = "--Select--"});
            return viewModel;
        }

    }

   
}
