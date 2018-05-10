using Keas.Core.Domain;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class AdminMembersAddModel
    {
       [Display(Name = "Role to Add")]
        public int RoleId { get; set; }

        public string UserEmail { get; set; }

        public List<Role> Roles { get; set; }

        public static async Task<AdminMembersAddModel> Create(ApplicationDbContext context)
        {

            var viewModel = new AdminMembersAddModel
            {
                Roles = await context.Roles.Where(r=> r.IsAdmin).OrderBy(x => x.Name).ToListAsync()
            };

            viewModel.Roles.Insert(0, new Role{ Id = 0, Name = "--Select--"});
            return viewModel;
        }

    }

   
}
