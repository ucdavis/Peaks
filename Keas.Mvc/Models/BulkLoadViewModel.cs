using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class BulkLoadViewModel
    {
        [Required]
        [Display(Name = "PPS Department Code")]
        public string PPSDeptCode { get; set; }
    }
}