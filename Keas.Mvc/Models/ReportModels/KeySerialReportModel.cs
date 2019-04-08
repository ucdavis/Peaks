namespace Keas.Mvc.Models.ReportModels
{
    public class KeySerialReportModel
    {
        public string SerialName { get; set; }
        public string SerialNumber { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public bool Active { get; set; }
        public AssignmentReportModel Assignment { get; set; }
    }
}
