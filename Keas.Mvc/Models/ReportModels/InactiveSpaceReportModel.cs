namespace Keas.Mvc.Models.ReportModels
{
    public class InactiveSpaceReportModel
    {
        public string TeamSlug { get; set; }
        public string DetailsLink { get; set; }
        
        public string Room {get;set; }
        public string RoomName { get; set; }
        public int EquipmentCount {get;set; }
        public int KeyCount { get; set; }
        public int WorkStationCount { get; set; }
    }
}
