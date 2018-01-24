using System;

namespace Keas.Core.Domain
{
    public abstract class AssignmentBase {
        public AssignmentBase()
        {
            RequestedAt = DateTime.UtcNow;
        }

        public int Id { get; set; }

        public Person Person { get; set; }
        public int PersonId { get; set; }
        
        //TODO: copy the person name for easy access

        public DateTime RequestedAt { get; set; }
        public User RequestedBy {get;set;}
        public string RequestedByName { get; set; }
        
        public DateTime? ApprovedAt { get; set; }

        public DateTime ExpiresAt { get; set; }
    }
}