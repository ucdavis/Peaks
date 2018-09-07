using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Core.Models
{
    public class ExpiringItemsEmailModel
    {
        public List<AccessAssignment> AccessAssignments { get; set; }
        public List<KeyAssignment> KeyAssignments { get; set; }
        public List<EquipmentAssignment> EquipmentAssignments { get; set; }
        public List<WorkstationAssignment> WorkstationAssignments { get; set; }


        public static ExpiringItemsEmailModel Create(List<AccessAssignment> accessAssignment, List<KeyAssignment> keyAssignment, List<EquipmentAssignment> equipmentAssignment, List<WorkstationAssignment> workstationAssignment)
        {
            var viewModel = new ExpiringItemsEmailModel
            {
                AccessAssignments = accessAssignment,
                KeyAssignments = keyAssignment,
                EquipmentAssignments = equipmentAssignment,
                WorkstationAssignments = workstationAssignment
            };
            return viewModel;
        }
    }
}
