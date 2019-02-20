using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class KeyImport
{
    
    [Required]
    public string KeyName { get; set; }
    [Required]
    public string KeyCode { get; set; }     
    
    [Required]
    public string  SerialNumber { get; set; }  

    public string KerbUser { get; set; }

    public DateTime? DateIssued { get; set; }

    public DateTime? DateDue { get; set; }

    public string Status { get; set; }

}

public class KeyImportResults 
{
    public KeyImport Import { get; set; }
    public int LineNumber { get; set; }
    public bool Success { get; set; }
    public List<string> ErrorMessage { get; set; }

    public List<string> Messages { get; set; }

    public KeyImportResults(KeyImport import)
    {
        Messages = new List<string>();
        ErrorMessage = new List<string>();
        Import = new KeyImport
        {
            DateDue = import.DateDue,
            DateIssued = import.DateIssued,
            KerbUser = import.KerbUser,
            KeyCode = import.KeyCode,
            SerialNumber = import.SerialNumber,
            KeyName = import.KeyName,
            Status = import.Status
        };
    }

    public KeyImportResults()
    {
        Messages = new List<string>();
        ErrorMessage = new List<string>();
    }
}
