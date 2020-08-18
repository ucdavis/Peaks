namespace Keas.Core.Domain
{
    public class EquipmentAssignment : AssignmentBase {
        public int EquipmentId { get; set; }
        public Equipment Equipment { get; set; }
    }
}
