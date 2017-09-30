using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Keas.Core.Domain
{
    public class TeamMember
    {

        [Required]
        [Key]
        public int Id { get; set; }
        
        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }
        
        
        [Required]
        public User User { get; set; }
        public string UserId { get; set; }

        //[InverseProperty("Assignee")]
        //public List<Assignment> GivenAssignments { get; set; }

        //[InverseProperty("Supervisor")]
        //public List<Assignment> SupervisedAssignments { get; set; }

        //[InverseProperty("AssignedToTeamMember")]
        //public List<Asset> AssignedToAssets { get; set; }

        //[InverseProperty("AssignedByTeamMember")]
        //public List<Asset> AssignedByAssets { get; set; }

        public List<TeamRole> TeamRoles { get; set; }

    }
}
