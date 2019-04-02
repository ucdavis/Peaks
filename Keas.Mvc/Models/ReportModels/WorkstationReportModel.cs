using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models.ReportModels
{
    public class WorkstationReportModel
    {
        public string Name { get; set; }
        public string Notes { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public bool IsAssigned { get; set; } //WorkstationAssignmentId.HasValue()

        public WorkstationAssignmentReportModel AssignmentModel { get; set; }
        public SpaceReportModel Space { get; set; }

    }

    public class WorkstationAssignmentReportModel
    {
        public int PersonId { get; set; }
        public string FullName { get; set; }

        public string UserId { get; set; }
        public string Email { get; set; }
        public DateTime ExpiryDateTime { get; set; }
    }

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
