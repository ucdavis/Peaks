using System;
using System.ComponentModel.DataAnnotations;

namespace Keas.Mvc.Models
{
    public class EmulateUserViewModel
    {
        [Display(Name = "Search by Email")]
        public string UserEmail { get; set; }
    }
}
