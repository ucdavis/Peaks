using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Keas.Core.Domain
{
    public class EquipmentAttributeKey {
        public int Id { get; set; }
        public Team Team { get; set; }
        public int? TeamId { get; set; }
        [Required]
        public string Key { get; set; }
        [Required]
        [StringLength(50)]
        public string Description { get; set; }
    }
}
