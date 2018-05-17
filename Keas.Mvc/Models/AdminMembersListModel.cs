using Keas.Core.Domain;
using System.Collections.Generic;
using System.Linq;

namespace Keas.Mvc.Models
{
    public class AdminMembersListModel
    {

       public List<AdminUserRole> UserRoles { get; set; }

        public static AdminMembersListModel Create(List<SystemPermission> systemPermission, string userId)
        {
            var viewModel = new AdminMembersListModel()
            {
                UserRoles = new List<AdminUserRole>()
            };


            if (userId != null)
            {
                systemPermission = systemPermission.Where(sp => sp.UserId == userId).ToList();
            }
            foreach (var permission in systemPermission)
            {
                if (viewModel.UserRoles.Any(a => a.User.Id == permission.User.Id))
                {
                    viewModel.UserRoles.Single(a => a.User.Id == permission.User.Id).Roles
                        .Add(permission.Role);
                }
                else
                {
                    viewModel.UserRoles.Add(new AdminUserRole(permission));
                }
            }
            return viewModel;
        }

    }

    public class AdminUserRole
    {
        public User User { get; set; }

        public IList<Role> Roles { get; set; }

        public AdminUserRole(SystemPermission systemPermission)
        {
            User = systemPermission.User;
            Roles = new List<Role>();
            Roles.Add(systemPermission.Role);
        }

        public string RolesList
        {
            get { return string.Join(", ", Roles.OrderBy(x => x.Name).Select(a => a.Name).ToArray()); }
        }
    }
}
