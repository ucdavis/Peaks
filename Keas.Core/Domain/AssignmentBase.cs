using System;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public abstract class AssignmentBase {
        public AssignmentBase()
        {
            RequestedAt = DateTime.UtcNow;
            IsConfirmed = false;
        }

        public int Id { get; set; }

        public Person Person { get; set; }
        public int PersonId { get; set; }
        
        //TODO: copy the person name for easy access

        public DateTime RequestedAt { get; set; }
        public User RequestedBy {get;set;}
        public string RequestedByName { get; set; }
        
        public DateTime? ApprovedAt { get; set; }

        [DisplayFormat(DataFormatString = "{0:d}", ApplyFormatInEditMode = true)]
        public DateTime ExpiresAt { get; set; }

        public bool IsConfirmed { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? NextNotificationDate { get; set; }

        public Team Team { get; set; }
        public int? TeamId { get; set; }

        public string GetDescription(string asset, string title, Person actor, string action)
        {            
            return asset + "(" + title + ") " + action + " to " +  Person.Name + " (" + Person.UserId + ") " + " by " + actor.Name + " (" + actor.UserId + ")";
        }

    }
}
