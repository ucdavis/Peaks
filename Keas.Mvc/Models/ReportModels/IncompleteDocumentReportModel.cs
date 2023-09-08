using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class IncompleteDocumentReportModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int IncompleteDocumentCount { get; set; }

        public int PersonId { get; set; }

        public string TeamName { get; set; }
        public string TeamSlug { get; set; }

        public string Name
        {
            get
            {
                return $"{LastName}, {FirstName}";
            }
        }
    }
}
