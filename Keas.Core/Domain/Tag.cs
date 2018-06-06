using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Tag
    {

        [Key]
        public int Id { get; set; }

        // TODO: make this a unique field
        [StringLength(128)]
        [Required]
        public string Name { get; set; }


        public Team Team { get; set; }
        public int TeamId { get; set; }
    }
}
