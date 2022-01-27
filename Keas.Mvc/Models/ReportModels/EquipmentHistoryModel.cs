using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models.ReportModels
{
    public class EquipmentHistoryModel
    {
        public Equipment Equipment { get;set;}
        public Person Person { get;set;}

        public IEnumerable<History> Histories { get; set; }
    }
}
