using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class SystemPermission
    {
        public int Id { get; set; }

        [Required]
        public User User { get; set; }
        public string UserId { get; set; }

        [Required]
        public Role Role { get; set; }
        public int RoleId { get; set; }
    }
}
