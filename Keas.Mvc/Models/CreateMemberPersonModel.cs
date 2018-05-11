using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public class CreateMemberPersonModel
    {
        public bool Active { get; set; }
        
        public CreateMemberUserModel User { get; set; }
        public string UserId { get; set; }

        public string Group { get; set; }
        
        public string Title { get; set; }
        public string HomePhone { get; set; }
        public string TeamPhone { get; set; }
    }

    public class CreateMemberUserModel
    {
        [Key]
        public string Id { get; set; }

        [StringLength(50)]
        public string FirstName { get; set; }

        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        [StringLength(256)]
        public string Name { get; set; }

        [Required]
        [StringLength(256)]
        [EmailAddress]
        public string Email { get; set; }
    }
}
