using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class TeamMember
    {

        [Required]
        [Key]
        public int Id { get; set; }

        [Required]
        public Team Team { get; set; }

        [Required]
        public User User { get; set; }

    }
}
