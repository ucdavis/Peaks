using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class PeopleImport
    {
        [Required]
        public string KerbId { get; set; }

        [StringLength(50)]
        public string OverrideFirstName { get; set; }

        [StringLength(50)]
        public string OverrideLastName { get; set; }

        [StringLength(256)]
        [EmailAddress]
        public string OverrideEmail { get; set; }

        public string SupervisorKerbId { get; set; }
        public string Title { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string HomePhone { get; set; } //Look at formatting in Person.cs .
        public string TeamPhone { get; set; }

        public string Category { get; set; }
        public string Tags { get; set; }
        public string Notes { get; set; }
    }

    public class PeopleImportResult
    {
        public PeopleImport PeopleImport { get; set; }
        public int LineNumber { get; set; }
        public bool Success { get; set; }
        public List<string> ErrorMessage { get; set; }

        public List<string> Messages { get; set; }

        public PeopleImportResult()
        {
            Messages = new List<string>();
            ErrorMessage = new List<string>();
        }

        public PeopleImportResult(PeopleImport import)
        {
            PeopleImport.KerbId            = import.KerbId;
            PeopleImport.OverrideFirstName = import.OverrideFirstName;
            PeopleImport.OverrideLastName  = import.OverrideLastName;
            PeopleImport.OverrideEmail     = import.OverrideEmail;
            PeopleImport.SupervisorKerbId  = import.SupervisorKerbId;
            PeopleImport.StartDate         = import.StartDate;
            PeopleImport.EndDate           = import.EndDate;
            PeopleImport.HomePhone         = import.HomePhone;
            PeopleImport.TeamPhone         = import.TeamPhone;
            PeopleImport.Category          = import.Category;
            PeopleImport.Tags              = import.Tags;
            PeopleImport.Notes             = import.Notes;
 
        }

    }
}
