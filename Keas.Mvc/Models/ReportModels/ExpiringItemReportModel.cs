using System;

namespace Keas.Mvc.Models.ReportModels
{
    public class ExpiringItemReportModel
    {
        public string Type { get;set; }
        public string ItemName { get;set; }
        public string PersonName { get;set;}
        public DateTime ExpiresAt { get;set;}
        public string TeamSlug { get;set;}
        public string DetailsLink { get;set;}

    }
}
