using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Keas.Core.Extensions;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Keas.Core.Domain
{
    public class Person {
        public Person()
        {
            Active = true;
            AccessAssignments = new List<AccessAssignment>();
        }
        public int Id { get; set; }

        public bool Active { get; set; }
        public Team Team { get; set; }
        public int TeamId { get; set; }

        public User User { get; set; }

        public string UserId { get; set; }

        [Required]
        [StringLength(50)]
        [Display(Name = "First Name")]        
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        [Display(Name = "Last Name")]        
        public string LastName { get; set; }

        [StringLength(256)]
        [Display(Name = "Name")]        
        public string Name { 
            get {
                return FirstName + " " + LastName;
            }
         }

        [Required]
        [StringLength(256)]
        [EmailAddress]
        public string Email { get; set; }

        public string Group { get; set; }

        public string Tags { get; set; }

        // METADATA
        public string Title { get; set; }
        private string _HomePhone;

        public string HomePhone
        {
            get { return _HomePhone.FormatPhone(); }
            set { _HomePhone = value.FormatPhone(); }
        }

        private string _TeamPhone;

        public string TeamPhone
        {
            get { return _TeamPhone.FormatPhone(); }
            set { _TeamPhone = value.FormatPhone(); }
        }

        public int? SupervisorId {   get; set; }

        public Person Supervisor { get; set; }
        
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string Category { get; set; }

        [DataType(DataType.MultilineText)]
        public string Notes { get; set; }

        [NotMapped]
        public bool IsSupervisor { get; set; }

        public List<AccessAssignment> AccessAssignments { get; set; }

        public List<KeySerialAssignment> KeySerialAssignments { get; set; }

        protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Person>().HasQueryFilter(a => a.Active);
        }
    }
}
