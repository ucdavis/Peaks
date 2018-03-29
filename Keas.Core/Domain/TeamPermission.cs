using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class TeamPermission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }

        [Required]
        public Person Person { get; set; }
        public int PersonId { get; set; }

        [Required]
        public Role TeamRole { get; set; }
        public int RoleId { get; set; }

    }
}
