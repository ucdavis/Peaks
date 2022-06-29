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
        public List<Document> Docs {get;set;}
    }
}
