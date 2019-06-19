using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    [Table("vExtendedPersonViews")]
    [ReadOnly(true)]
    public class ExtendedPersonView
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int? SupervisorId { get; set; }
        public string S_FirstName { get; set; }
        public string S_LastName { get; set; }
        public string S_Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Tags { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Category { get; set; }
        public string Slug { get; set; }
        public DateTime? LastAddDate { get; set; }
    }


}
