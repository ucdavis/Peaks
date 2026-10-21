using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class LocalLoginModel
    {
        [Required]
        [StringLength(256)]
        [Display(Name = "Kerberos ID or email")]
        public string Login { get; set; }
        public string ReturnUrl { get; set; }
    }
}
