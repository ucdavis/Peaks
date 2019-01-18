using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class FeedPeopleModel
    {        
        public string FirstName { get; set; }

        public string LastName { get; set; }
        public string Name { get; set;  }
        public string Email { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string TeamPhone {get; set; }
        public string Tags { get; set; }
        
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
