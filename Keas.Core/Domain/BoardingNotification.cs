using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class BoardingNotification
    {
        public BoardingNotification()
        {
            Pending = true;
            ActionDate = DateTime.UtcNow;
        }

        public int Id { get; set; }
        public bool Pending { get; set; }
        [EmailAddress]
        [StringLength(256)]
        public string NotificationEmail { get; set; }
        [EmailAddress]
        [StringLength(256)]
        public string PersonEmail { get; set; }
        [StringLength(256)]
        public string PersonName { get; set; }
        public int PersonId { get; set; } 

        public DateTime ActionDate { get; set; }
        [StringLength(256)]
        public string ActorName { get; set; }
        public string ActorId { get; set; }
        [StringLength(50)]
        public string Action { get; set; }
        [StringLength(256)]
        public string Notes { get; set; }
        
        public Team Team { get; set; }
        public int? TeamId { get; set; }
        
        public DateTime? NotificationDate { get; set; }

        //Non mapped
        public bool SendEmail => !string.IsNullOrWhiteSpace(NotificationEmail);

        public class Actions
        {
            public const string Added = "Added";
            public const string Activated = "Activated";
            public const string Deactivated = "Deactivated";
        }
    }
}
