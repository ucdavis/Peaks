using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Domain
{
    public class BoardingNotification
    {
        public BoardingNotification()
        {
            Pending = true;
        }

        public int Id { get; set; }
        public bool Pending { get; set; }
        public string NotificationEmail { get; set; }

        public string PersonEmail { get; set; }
        public string PersonName { get; set; }
        public int PersonId { get; set; } 

        public DateTime ActionDate { get; set; }
        public string Actor { get; set; }
        
        public Team Team { get; set; }
        public int? TeamId { get; set; }
        
        public DateTime? NotificationDate { get; set; }
    }
}
