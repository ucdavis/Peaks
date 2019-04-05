using System;
using System.Collections.Generic;

namespace Keas.Mvc.Models.ReportModels
{
    public class FeedPeopleModel
    {        
        public bool Active { get; set; }
        public string FirstName { get; set; }

        public string LastName { get; set; }
        public string Name { get; set;  }
        public string Email { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string TeamPhone {get; set; }
        public string HomePhone { get; set; }
        public string Tags { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Supervisor { get; set; } //Show this as the person instead of the name?
        public string Category { get; set; }
        public string Notes { get; set; }
        
    }

    public class FeedPeopleSpaceModel : FeedPeopleModel
    {
        public List<FeedWorkstation> Workstations { get; set; }
        
    }

    public class FeedWorkstation
    {
        public string Name { get; set; }
        public string BldgName { get; set; }

        public string RoomNumber { get; set; }
        
    }
}
