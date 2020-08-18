namespace Keas.Core.Domain
{
    public class WorkstationAssignment : AssignmentBase {
        //public int WorkstationId { get; set; } If the ID is added, need to update foreign keys
        public Workstation Workstation { get; set; }
    }
}
