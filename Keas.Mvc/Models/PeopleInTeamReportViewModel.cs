using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class PeopleInTeamReportViewModel
    {
        [Display(Name = "Hide Inactive")]
        public bool HideInactive { get; set; }

        public IList<Person> PeopleList { get; set; }
    }
}
