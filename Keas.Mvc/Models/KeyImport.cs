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
    public string ErrorMessage { get; set; }

    public List<string> Messages { get; set; }

    public KeyImportResults(KeyImport import)
    {
        Messages = new List<string>();
        Import = import;
    }

    public KeyImportResults()
    {
        Messages = new List<string>();
    }
}
