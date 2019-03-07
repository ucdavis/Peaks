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

        public string Type { get; set; }

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
        public string Notes { get; set; }

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
                SerialNumber = import.SerialNumber,
                Make = import.Make,
                Model = import.Model,                
                Tag = import.Tag,
                Type = import.Type,
                Key1 = import.Key1,
                Value1 = import.Value1,
                Key2 = import.Key2,
                Value2 = import.Value2,
                Key3 = import.Key3,
                Value3 = import.Value3,
                Key4 = import.Key4,
                Value4 = import.Value4,
                Key5 = import.Key5,
                Value5 = import.Value5,
                Key6 = import.Key6,
                Value6 = import.Value6,
                Notes = import.Notes,
            };
        }

        public EquipmentImportResults()
        {
            Messages = new List<string>();
            ErrorMessage = new List<string>();
        }
    }
}
