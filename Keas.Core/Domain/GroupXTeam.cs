using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class GroupXTeam
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Group Key { get; set; }
        public int GroupId { get; set; }

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }
    }
}
