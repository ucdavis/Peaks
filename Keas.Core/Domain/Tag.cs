using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Tag
    {
        [Key]
        public int Id { get; set; }
        
        [StringLength(128)]
        [Required]
        [RegularExpression("[\\w- ]+", ErrorMessage = "Only Letters, numbers, spaces, and - allowed")]
        public string Name { get; set; }


        public Team Team { get; set; }
        public int TeamId { get; set; }
    }
}
