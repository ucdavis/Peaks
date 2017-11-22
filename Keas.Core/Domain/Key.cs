using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Key : AssetBase {

        [Required]
        [StringLength(64)]
        public string SerialNumber { get; set; }

        public string LockId { get; set; }

        public string Rooms { get; set; }
    }
}