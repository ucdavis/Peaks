using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class TeamPpsDepartment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(6)]
        public string PpsDepartmentCode { get; set; }

        public string DepartmentName { get; set; }

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }
    }
}
