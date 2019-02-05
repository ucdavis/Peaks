using System;
using System.ComponentModel.DataAnnotations;

public class KeyImport
{
    public string KeyName { get; set; }
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