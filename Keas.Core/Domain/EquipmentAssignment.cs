namespace Keas.Core.Domain
{
    public class EquipmentAssignment : AssignmentBase {
        public Equipment Equipment { get; set; }
        public int EquipmentId { get; set; }
    }
}