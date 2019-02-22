using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class EquipmentImport
    {

        [Required]
        public string EquipmentName { get; set; }
        
        public string SerialNumber { get; set; }
       
        public string Make { get; set; }
        public string Model { get; set; }

        public string KerbUser { get; set; }

        public DateTime? DateIssued { get; set; }

        public DateTime? DateDue { get; set; }

        public string Tag { get; set; }

        public string Key1 { get; set; }
        public string Value1 { get; set; }
        public string Key2 { get; set; }
        public string Value2 { get; set; }
        public string Key3 { get; set; }
        public string Value3 { get; set; }
        public string Key4 { get; set; }
        public string Value4 { get; set; }
        public string Key5 { get; set; }
        public string Value5 { get; set; }
        public string Key6 { get; set; }
        public string Value6 { get; set; }

    }

    public class EquipmentImportResults
    {
        public EquipmentImport Import { get; set; }
        public int LineNumber { get; set; }
        public bool Success { get; set; }
        public List<string> ErrorMessage { get; set; }

        public List<string> Messages { get; set; }

        public EquipmentImportResults(EquipmentImport import)
        {
            Messages = new List<string>();
            ErrorMessage = new List<string>();
            Import = new EquipmentImport
            {
                DateDue = import.DateDue,
                DateIssued = import.DateIssued,
                KerbUser = import.KerbUser,
                EquipmentName = import.EquipmentName,
                SerialNumber = import.SerialNumber                
            };
        }

        public EquipmentImportResults()
        {
            Messages = new List<string>();
            ErrorMessage = new List<string>();
        }
    }
}
