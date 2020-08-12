using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class EquipmentReportViewModel
    {
        [Display(Name = "Hide Inactive")]
        public bool HideInactive { get; set; }

        public Core.Domain.Group Group { get; set; }
        public IList<EquipmentReportModel> EquipmentList { get; set; }
    }
}
