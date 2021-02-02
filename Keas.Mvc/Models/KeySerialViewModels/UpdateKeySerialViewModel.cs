using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.KeySerialViewModels
{
    public class UpdateKeySerialViewModel
    {
        [Required]
        [StringLength(64)]
        public string Number { get; set; }

        [Required]
        public string Status { get; set; }

        public string Notes { get; set; }
    }
}
