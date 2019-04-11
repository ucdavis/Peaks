using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public class BulkEditModel
    {
        public IList<PersonBulkEdit> BulkPersons { get; set; }
        public string Category { get; set; }
        public string Ids { get; set; }
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
