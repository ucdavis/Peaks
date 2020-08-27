using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class IncompleteDocumentReportModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int IncompleteDocumentCount { get; set; }

        public int PersonId { get; set; }
    }
}
