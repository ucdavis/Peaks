namespace Keas.Core.Domain
{
    public class WorkstationAssignment : AssignmentBase {
        public int WorkstationId { get; set; }
        public Workstation Workstation { get; set; }
    }
}
