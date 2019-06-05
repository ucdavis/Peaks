using Keas.Core.Domain;
using System.Collections.Generic;

namespace Keas.Mvc.Models
{
    public class SelectTeamOrGroupModel
    {
        public IList<Team> Teams { get; set; }
        public IList<Group> Groups { get; set; }
    }
}
