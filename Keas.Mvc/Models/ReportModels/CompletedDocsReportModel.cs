using Keas.Core.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models.ReportModels
{
    public class CompletedDocsReportModel
    {
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Display(Name = "Start Created Date")]
        public DateTime Start {get;set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Display(Name = "End Created Date")]
        public DateTime End { get; set; }

        public Group Group { get; set; }
        public List<Document> Docs {get;set;}

        public CompletedDocsReportModelItem[] Items { get; set; }
    }

    public class CompletedDocsReportModelItem
    {
        public string PersonName { get; set; }
        public string DocName { get; set; }
        [DisplayFormat(DataFormatString = "{0:d}")]
        public DateTime CreatedAt { get; set; }
        [DisplayFormat(DataFormatString = "{0:d}")]
        public DateTime? CompletedAt { get; set; }
        public string TeamSlug { get; set; }
        public string TeamName { get; set; }
        public string DetailsLink { get; set; }

    }
}
