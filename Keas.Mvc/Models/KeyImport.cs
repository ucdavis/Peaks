using System;
using System.ComponentModel.DataAnnotations;

public class KeyImport
{
    [Required]
    public string Keynumber { get; set; }
    [Required]
    public string  SerialNumber { get; set; }
    public string Description { get; set; }

    public string KerbUser { get; set; }

    public DateTime DateIssued { get; set; }

    public DateTime DateDue { get; set; }

    public string Status { get; set; }

}