using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Models
{
    public class KeyDTO
    {
        public int Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public string Notes { get; set; }

        public int TeamId { get; set; }
        
        public string Tags { get; set; }
    }

    public class KeyResponse
    {
        [Required]
        public int Id { get; set; }
        
        public KeyDTO Key { get; set; }

        public int SpacesCount { get; set; }

        public int SerialsInUseCount { get; set; }
 
        public int SerialsTotalCount { get; set; }
    }
}
