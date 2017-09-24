
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Asset
    {
        [Required]
        [Key]
        public int Id { get; set; }

       public TeamMember AssignedToTeamMember { get; set; }

        public TeamMember AssignedByTeamMember { get; set; }

      //  public Location Location { get; set; }

        public string Type { get; set; }

        // TODO: Assett info JSON goes here?


    }
}
