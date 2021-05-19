namespace Keas.Mvc.Models.ReportModels
{
    public class KeyReportModel
    {
        public string KeyName { get; set; }
        public string Team { get; set; }
        public string Code { get; set; }
        public string Notes { get; set; }
        public string Tags { get; set; }
        public bool Active { get; set; }
        public int KeySerialCount { get; set; }
        public int SpacesCount { get; set; }
        public SpaceReportModel[] Spaces { get; set; }
        public KeySerialReportModel[] Serials { get; set; }
    }
}
