using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class TeamsAndGroupsModel
    {
        public IList<Team> Teams { get; set; }
        public IList<Group> Groups { get; set; }
    }
}
