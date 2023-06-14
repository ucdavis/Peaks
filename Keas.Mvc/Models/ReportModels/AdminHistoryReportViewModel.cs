using System.ComponentModel.DataAnnotations;
using System;
using Keas.Core.Domain;
using System.Collections.Generic;

namespace Keas.Mvc.Models.ReportModels
{
    public class AdminHistoryReportViewModel
    {
        public string TeamSlug { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? Start { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? End { get; set; }

        public List<Person> Admins { get; set; } = new List<Person>();

        [Display(Name = "Select User")]
        public int PersonId { get; set; }

        public List<History> Histories { get; set; } = new List<History>();
    }
}
