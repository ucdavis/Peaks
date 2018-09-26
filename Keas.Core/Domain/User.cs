using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class User
    {
        // kerb ID
        [Key]
        public string Id { get; set; }

        // TODO: make a key?
        public string Iam {get; set;}

        [Required]
        [StringLength(50)]
        [Display(Name = "First Name")]        
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        [Display(Name = "Last Name")]        
        public string LastName { get; set; }

        [StringLength(256)]
        [Display(Name = "Name")]        
        public string Name { 
            get {
                return FirstName + " " + LastName;
            }
        }

        [Required]
        [StringLength(256)]
        [EmailAddress]
        public string Email { get; set; }
        
        public List<Person> People { get; set; }
        public List<TeamPermission> TeamPermissions { get; set; }
    }
}