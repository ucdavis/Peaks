
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Asset
    {
        [Required]
        [Key]
        public int Id { get; set; }


        public TeamMember AssignedToTeamMember { get; set; }
        public int AssignedToTeamMemberId { get; set; }

        public TeamMember AssignedByTeamMember { get; set; }
        public int AssignedByTeamMemberId { get; set; }

        public Location Location { get; set; }
        public int LocationId { get; set; }

        public string Type { get; set; }

        // TODO: Asset info (JSON???) goes here


    }
}
