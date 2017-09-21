using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class TeamRoles
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public Team Team { get; set; }

        [Required]
        public User User { get; set; }

    }
}
