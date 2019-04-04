using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class AccessReportModel
    {
        public string Name { get; set; }
        public string Notes { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public int AssignmentCount { get; set; }

        public AssignmentReportModel[] Assignments { get; set; }

    }
}
