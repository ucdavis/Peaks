

using System;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Assignment
    {
        [Required]
        [Key]
        public int Id { get; set; }

        public TeamMember TeamMember { get; set; }
        public int TeamMemberId { get; set; }

        public DateTime StartDate { get; set; }

        // TODO: Figue out what appointment info we need. Sync with PPS/Path/IAM????

        public TeamMember Supervisor { get; set; }
        public int SupervisorId { get; set; }

    }
}
