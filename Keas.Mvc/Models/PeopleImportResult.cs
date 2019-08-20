using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Keas.Mvc.Models
{
    public class PeopleImportModel
    {
        public bool UpdateExistingUsers { get; set; }
        public List<PeopleImportResult> ImportResult { get; set; }

        public IFormFile File { get; set; }
    }


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
        public string OverrideTitle { get; set; }
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
            Messages = new List<string>();
            ErrorMessage = new List<string>();
            PeopleImport = new PeopleImport
            {
                KerbId            = import.KerbId,
                OverrideFirstName = import.OverrideFirstName,
                OverrideLastName  = import.OverrideLastName,
                OverrideEmail     = import.OverrideEmail,
                SupervisorKerbId  = import.SupervisorKerbId,
                StartDate         = import.StartDate,
                EndDate           = import.EndDate,
                HomePhone         = import.HomePhone,
                TeamPhone         = import.TeamPhone,
                Category          = import.Category,
                Tags              = import.Tags,
                Notes             = import.Notes,
                OverrideTitle     = import.OverrideTitle
            };
        }

    }
}
