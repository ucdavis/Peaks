using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class PeopleLeavingWithAssetsModel
    {
        public int Id { get; set; }
        public bool Active { get; set; }
        [Display(Name = "First Name")]
        public string FirstName { get; set; }
        [Display(Name = "Last Name")]
        public string LastName { get; set; }
        public string Email { get; set; }
        [Display(Name = "Start Date")]
        public DateTime? StartDate { get; set; }
        [Display(Name = "End Date")]
        public DateTime? EndDate { get; set; }
        [Display(Name = "Equip Count")]
        public int EquipmentCount { get; set; }
        [Display(Name = "Access Count")]
        public int AccessCount { get; set; }
        [Display(Name = "Key Count")]
        public int KeyCount { get; set; }
        [Display(Name = "Wrk Stn Count")]
        public int WorkstationCount { get; set; }
        [Display(Name = "Team")]
        public string Slug { get; set; }


    }
}
