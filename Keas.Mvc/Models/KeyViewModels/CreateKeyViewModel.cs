using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.KeyViewModels
{
    public class CreateKeyViewModel
    {
        [Required]
        [StringLength(64)]
        public string Name { get; set; }

        [Required]
        [StringLength(64)]
        public string Code { get; set; }

        public string Notes { get; set; }

        public string Tags { get; set; }
    }
}
