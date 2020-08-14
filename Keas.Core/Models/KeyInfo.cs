using Keas.Core.Domain;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Models
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
