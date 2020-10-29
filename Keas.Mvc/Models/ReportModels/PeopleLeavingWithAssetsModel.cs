using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.ReportModels
{
    public class PeopleLeavingWithAssetsModel
    {
        public int Id { get; set; }
        public bool Active { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int EquipmentCount { get; set; }
        public int AccessCount { get; set; }
        public int KeyCount { get; set; }
        public int WorkstationCount { get; set; }
        public string Slug { get; set; }


    }
}
