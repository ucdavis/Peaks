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

        [DisplayFormat(DataFormatString = "{0:d}")]   
        public DateTime RequestedAt { get; set; }
        public User RequestedBy {get;set;}
        public string RequestedById { get; set; }
        public string RequestedByName { get; set; }
        
        public DateTime? ApprovedAt { get; set; }

        [DisplayFormat(DataFormatString = "{0:d}", ApplyFormatInEditMode = true)]
        public DateTime ExpiresAt { get; set; }

        public bool IsConfirmed { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? NextNotificationDate { get; set; }

        public string GetDescription(string asset, string title, Person actor, string action, string extraSpaceInfo = null)
        {
            var extra = string.Empty;
            if (!string.IsNullOrWhiteSpace(extraSpaceInfo))
            {
                extra = $" ({extraSpaceInfo.Trim()})";
            }
            return $"{asset} ({title}{extra}) {action} {Person.Name} ({Person.UserId}) by {actor.Name} ({actor.UserId})";
        }

    }
}
