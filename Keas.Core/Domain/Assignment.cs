

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Keas.Core.Domain
{
    public class Assignment
    {
        [Required]
        [Key]
        public int Id { get; set; }

        public string Title { get; set; }

        public int AssigneeTeamMemberId { get; set; }
        [ForeignKey("AssigneeTeamMemberId")]
        public TeamMember Assignee { get; set; }
        

        public DateTime StartDate { get; set; }

        // TODO: Figue out what appointment info we need. Sync with PPS/Path/IAM????

        [ForeignKey("SupervisorTeamMemberId")]
        public TeamMember Supervisor { get; set; }
        public int SupervisorTeamMemberId { get; set; }

    }
}
