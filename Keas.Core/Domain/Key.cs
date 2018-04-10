using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Key : AssetBase {

        [Required]
        [StringLength(64)]
        public string SerialNumber { get; set; }

        public string LockId { get; set; }
        public Room Room { get; set; }

        public KeyAssignment Assignment { get; set; }
        public int? KeyAssignmentId { get; set; }
    }
}