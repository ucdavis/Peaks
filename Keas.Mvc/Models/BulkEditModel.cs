using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class BulkEditModel
    {
        public IList<PersonBulkEdit> BulkPersons { get; set; }
        public string Ids { get; set; }


        public string Category { get; set; }
        [Display(Name = "Update Category")]
        public bool UpdateCategory { get; set; }
        [Display(Name = "Start Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? StartDate { get; set; }
        [Display(Name = "Update Start Date")]
        public bool UpdateStartDate { get; set; }
        [Display(Name = "End Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? EndDate { get; set; }
        [Display(Name = "Update End Date")]
        public bool UpdateEndDate { get; set; }
        
    }

    public class PersonBulkEdit
    {
        public int Id { get; set; } //PersonId
        public string UserId { get; set; }

        public string FirstName { get; set; }


        public string LastName { get; set; }
        public string Email { get; set; }

        public string SupervisorName { get; set; }
        public string Tags { get; set; }

        [Display(Name = "Name")]
        public string Name
        {
            get { return FirstName + " " + LastName; }
        }
    }
}
