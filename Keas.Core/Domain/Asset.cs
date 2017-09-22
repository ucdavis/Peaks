
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Asset
    {
        [Required]
        [Key]
        public int Id { get; set; }

        public TeamMember TeamMember { get; set; }

        public Location Location { get; set; }

        public string Type { get; set; }

        // TODO: Assett info JSON goes here?


    }
}
