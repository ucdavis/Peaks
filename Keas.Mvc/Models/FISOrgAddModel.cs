using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public class FISOrgAddModel
    {
        [StringLength(1)]
        public string Chart { get; set; }

        [StringLength(6)]
        [Required]
        [Display(Name = "Org Code")]
        public string OrgCode { get; set; }
    }
}
