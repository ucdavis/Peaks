using System;

namespace Keas.Core.Domain
{
    public class EmailQueue
    {
        public int Id { get; set; }

        public User User { get; set; }
        public History History { get; set; }
        public int HistoryId { get; set; }
        public string Details { get; set; }

        public bool Pending { get; set; }
        public DateTime? DateTimeSent { get; set; }
        public string Status { get; set; }
        public DateTime DateTimeCreated { get; set; }

        public EmailQueue()
        {
            Pending = true;
            DateTimeCreated = DateTime.UtcNow;
        }

    }
}

