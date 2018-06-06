using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class TeamTag
    {

        [Key]
        public int Id { get; set; }

        // TODO: make this a unique field
        [StringLength(128)]
        [Required]
        public string Tag { get; set; }


        public Team Team { get; set; }
        public int TeamId { get; set; }
    }
}
