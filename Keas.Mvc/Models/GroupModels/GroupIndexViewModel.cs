using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models.GroupModels
{
    public class GroupIndexViewModel
    {
        public Group Group { get; set; }

        public IList<GroupTeamContactInfo> TeamContact { get; set; }
    }
}
