using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    class TeamPermission
    {

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }

        [Required]
        public User User { get; set; }
        public string UserId { get; set; }

        [Required]
        public TeamRole TeamRole { get; set; }
        public int TeamRoleId { get; set; }

    }
}
