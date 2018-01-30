using System.Collections.Generic;

namespace Keas.Core.Domain
{
    public class Equipment : AssetBase {
        public Equipment()
        {
        //    Attributes = new List<EquipmentAttribute>();
        }

        // Computer / Phone / other
        public string Type { get; set; }

        public string SerialNumber { get; set; }

        public string Make { get; set; }
        public string Model { get; set; }

        public EquipmentAssignment Assignment { get; set; }
        public int? EquipmentAssignmentId { get; set; }
        //public List<EquipmentAttribute> Attributes { get; set; }

        //public void AddAttribute(string key, string value) {
        //    Attributes.Add(new EquipmentAttribute { Equipment = this, Key = key, Value = value });
        //}
    }
}