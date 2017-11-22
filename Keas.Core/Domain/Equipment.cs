using System.Collections.Generic;

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

        public List<EquipmentAttribute> Attributes { get; set; }
    }
}