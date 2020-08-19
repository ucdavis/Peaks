using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class TeamApiCode
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Team Team { get; set; }
        
        public int TeamId { get; set; }

        public Guid ApiCode { get; set; }
    }
}
