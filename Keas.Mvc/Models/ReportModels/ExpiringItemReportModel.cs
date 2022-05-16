using System;
using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models.ReportModels
{
    public class ExpiringItemReportModel
    {
        public string Type { get;set; }
        public string ItemName { get;set; }
        public string PersonName { get;set;}
        [DisplayFormat(DataFormatString = "{0:d}")]
        public DateTime ExpiresAt { get;set;}
        public string TeamSlug { get;set;}
        public string DetailsLink { get;set;}

        public bool PersonActive { get;set;}

    }
}
