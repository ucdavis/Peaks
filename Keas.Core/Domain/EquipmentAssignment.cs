using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class EquipmentAssignment : AssignmentBase {
        //public int EquipmentId { get; set; } If the ID is added, need to update foreign keys
        public Equipment Equipment { get; set; }

    }
}
