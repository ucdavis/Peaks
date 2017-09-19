using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class User
    {
        // IAM (campus identity) ID
        [Required]
        public string Id { get; set; }

        [StringLength(50)]
        [Display(Name = "First Name")]        
        public string FirstName { get; set; }

        [StringLength(50)]
        [Display(Name = "Last Name")]        
        public string LastName { get; set; }

        [Required]
        [StringLength(256)]
        [Display(Name = "Name")]        
        public string Name { get; set; }

        [Required]
        [StringLength(256)]
        [EmailAddress]
        public string Email { get; set; }
    }
}