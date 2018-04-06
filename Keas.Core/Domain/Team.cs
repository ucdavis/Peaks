using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Team
    {
        [Key]
        public int Id { get; set; }

        // TODO: make this a unique field
        [StringLength(128)]
        [Display(Name = "Team Name")]
        public string Name { get; set; }

        public List<Person> People { get; set; }

       public ICollection<TeamPermission> TeamPermissions { get; set; }
       
    }
}
