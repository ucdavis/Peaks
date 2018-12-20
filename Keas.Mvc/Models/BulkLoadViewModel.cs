using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class BulkLoadViewModel
    {
        [Required]
        [Display(Name = "PPS Department Code")]
        [RegularExpression("^[0-9]{6}", ErrorMessage = "PPS Department Code must be numeric with 6 digits.")]
        public string PPSDeptCode { get; set; }
    }
}