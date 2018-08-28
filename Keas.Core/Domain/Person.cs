using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Person {
        public Person()
        {
            Active = true;
            AccessAssignments = new List<AccessAssignment>();
        }
        public int Id { get; set; }

        public bool Active { get; set; }
        public Team Team { get; set; }
        public int TeamId { get; set; }

        public User User { get; set; }

        public string UserId { get; set; }

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

        public string Group { get; set; }

        public string Tags { get; set; }
        // METADATA
        public string Title { get; set; }
        public string HomePhone { get; set; }
        public string TeamPhone { get; set; }
        public List<AccessAssignment> AccessAssignments { get; set; }
    }
}