namespace Keas.Mvc.Models.ReportModels
{
    public class EquipmentReportModel
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string ProtectionLevel { get; set; }
        public string AvailabilityLevel { get; set; }
        public string SerialNumber { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string Notes { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public bool HasSpace { get; set; }
        public bool IsAssigned { get; set; }
        public int AttributeCount { get; set; }
        public AssignmentReportModel Assignment { get; set; }
        public SpaceReportModel Space { get; set; }
        public AttributeReportModel[] Attributes { get; set; }

    }

    public class AttributeReportModel
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}
