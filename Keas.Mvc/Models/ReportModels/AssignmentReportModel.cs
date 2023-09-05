using System;

namespace Keas.Mvc.Models.ReportModels
{
    public class AssignmentReportModel
    {
        public int PersonId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public DateTime ExpiryDateTime { get; set; }
        public bool IsConfirmed { get; set; }
        public DateTime? ConfirmedAt { get; set; }

        public DateTime RequestedAt { get; set; } //Just used for the equipment report V2
    }
}
