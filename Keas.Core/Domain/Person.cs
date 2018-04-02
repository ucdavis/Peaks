using System.Collections.Generic;

namespace Keas.Core.Domain
{
    public class Person {
        public Person()
        {
            Active = true;
        }
        public int Id { get; set; }

        public bool Active { get; set; }
        public Team Team { get; set; }
        public int TeamId { get; set; }

        public User User { get; set; }
        public string UserId { get; set; }

        public string Group { get; set; }
        // METADATA
        public string Title { get; set; }
        public string HomePhone { get; set; }
        public string TeamPhone { get; set; }

        //public List<AccessAssignment> AccessAssignments { get; set; }
    }
}