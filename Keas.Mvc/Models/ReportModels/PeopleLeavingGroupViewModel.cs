using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class PeopleLeavingGroupViewModel
    {
        public Core.Domain.Group Group { get; set; }
        public IList<PeopleLeavingWithAssetsModel> People { get; set; }
    }
}
