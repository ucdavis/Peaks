namespace Keas.Core.Domain
{
    public class AccessAssignment : AssignmentBase {
        public int AccessId { get; set; }
        public Access Access { get; set; }

    }
}