using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class KeyInfo
    {
        [Required]
        public int id { get; set; }
        
        public Key Key { get; set; }

        public int serialsInUseCount { get; set; }

        public int serialsTotalCount { get; set; }
    }
}
