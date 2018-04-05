using Keas.Core.Domain;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Keas.Core.Data;

namespace Keas.Mvc.Models
{
    public class TeamAdminMembersAddModel
    {

        public Team Team { get; set; }
        [Required]
        public Role Role { get; set; }

        [Required]
        public TeamMembership TeamMembership { get; set; }

        public List<Role> Roles { get; set; }

        public static TeamAdminMembersAddModel Create(Team team, ApplicationDbContext context)
        {
           
            var viewModel = new TeamAdminMembersAddModel()
            {
                Team = team,
            };

            viewModel.Roles = context.Roles.OrderBy(x=> x.Name).ToList();

            return viewModel;
        }

    }

   
}
