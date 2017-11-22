using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Team
    {
        [Key]
        public int Id { get; set; }

        [StringLength(128)]
        [Display(Name = "Team Name")]
        public string TeamName { get; set; }

        public List<TeamMembership> TeamMemberships { get; set; }
        
       // public Location Location { get; set; }

    }
}
