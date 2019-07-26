using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Equipment : AssetBase {
        public Equipment()
        {
            Attributes = new List<EquipmentAttribute>();
        }

        // Computer / Phone / other
        public string Type { get; set; }

        public string SerialNumber { get; set; }

        public string Make { get; set; }
        public string Model { get; set; }

        [StringLength(2)]
        public string ProtectionLevel { get; set; }

        [StringLength(2)]
        public string AvailabilityLevel { get; set; }

        public Space Space { get; set; }
        public int? SpaceId { get; set; }

        public EquipmentAssignment Assignment { get; set; }
        public int? EquipmentAssignmentId { get; set; }
        public List<EquipmentAttribute> Attributes { get; set; }

        public void AddAttribute(string key, string value)
        {
            Attributes.Add(new EquipmentAttribute { Equipment = this, Key = key, Value = value });
        }

         protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Equipment>().HasQueryFilter(a => a.Active);
        }
    }
}
