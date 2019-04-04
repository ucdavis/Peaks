namespace Keas.Mvc.Models.ReportModels
{
    public class WorkstationReportModel
    {
        public string Name { get; set; }
        public string Notes { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public bool IsAssigned { get; set; } //WorkstationAssignmentId.HasValue()

        public AssignmentReportModel Assignment { get; set; }
        public SpaceReportModel Space { get; set; }

    }

}
