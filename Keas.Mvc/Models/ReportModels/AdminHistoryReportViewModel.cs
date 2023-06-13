using System.ComponentModel.DataAnnotations;
using System;
using Keas.Core.Domain;
using System.Collections.Generic;

namespace Keas.Mvc.Models.ReportModels
{
    public class AdminHistoryReportViewModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? Start { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? End { get; set; }

        public List<Person> Admins { get; set; } = new List<Person>();

        [Display(Name = "Select User")]
        public int PersonId { get; set; }

        public List<History> Histories { get; set; } = new List<History>();
    }
}
