namespace Keas.Core.Domain
{
    public class EquipmentAttribute {
        public int Id { get; set; }
        public Equipment Equipment { get; set; }
        public int EquipmentId { get; set; }

        public string Key { get; set; }
        public string Value { get; set; }
    }
}