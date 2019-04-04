using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class SpaceReportModel
    {
        public string RoomNumber { get; set; }
        public string BldgName { get; set; }
        public string RoomName { get; set; }
        public string FloorName { get; set; }
        public string RoomCategoryName { get; set; }
        public int? SqFt { get; set; }
    }
}
