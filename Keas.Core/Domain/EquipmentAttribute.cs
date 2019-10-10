using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Keas.Core.Domain
{
    public class EquipmentAttribute {
        public int Id { get; set; }
        public Equipment Equipment { get; set; }
        public int EquipmentId { get; set; }

        [StringLength(64)]
        [Required]
        public string Key { get; set; }
        [StringLength(64)]
        public string Value { get; set; }
    }
}