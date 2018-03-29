using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Keas.Core.Domain
{
    public class TeamMembership
    {
        [Key]
        public int Id { get; set; }
        
        //[Required]
        //[StringLength(50)]
        //public string Role { get; set; }

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }
        
        [Required]
        public User User { get; set; }
        public string UserId { get; set; }
    }
}
