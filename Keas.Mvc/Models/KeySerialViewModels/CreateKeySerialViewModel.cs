using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.KeySerialViewModels
{
    public class CreateKeySerialViewModel
    {
        public int KeyId { get; set; }

        [Required]
        [StringLength(64)]
        public string Number { get; set; }

        public string Status { get; set; }

        public string Notes { get; set; }
    }
}
