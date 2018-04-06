using Keas.Core.Domain;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Keas.Core.Data;

namespace Keas.Mvc.Models
{
    public class TeamAdminMembersAddModel
    {
        [Required]
        public Team Team { get; set; }

        [Display(Name = "Role to Add")]
        public int RoleId { get; set; }

        public string UserEmail { get; set; }

        public List<Role> Roles { get; set; }

        public static TeamAdminMembersAddModel Create(Team team, ApplicationDbContext context)
        {
           
            var viewModel = new TeamAdminMembersAddModel()
            {
                Team = team,
            };
            
           viewModel.Roles = context.Roles.OrderBy(x=> x.Name).ToList();
            viewModel.Roles.Insert(0, new Role{ Id = 0, Name = "--Select--"});
            return viewModel;
        }

    }

   
}
