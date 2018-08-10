using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class Serials
    {
        [Key]
        public int Id { get; set; }

        public Key Key { get; set; }
        public int KeyId { get; set; }

        public string Serial { get; set; }

        public KeyAssignment Assignment { get; set; }
        public int? KeyAssignmentId { get; set; }
    }
}
