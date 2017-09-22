using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Team
    {
        [Required]
        [Key]
        public int Id { get; set; }

        [StringLength(50)]
        [Display(Name = "Team Name")]
        public string TeamName { get; set; }

        
       // public Location Location { get; set; }

    }
}
