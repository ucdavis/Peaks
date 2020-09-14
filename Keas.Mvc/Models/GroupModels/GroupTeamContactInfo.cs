using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.GroupModels
{
    public class GroupTeamContactInfo
    {
        public string TeamName { get; set; }
        public string TeamSlug { get; set; }
        public string FirstDeptAdmin { get; set; }
        public bool InGroup { get; set; } = true;
    }
}
