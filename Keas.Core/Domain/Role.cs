using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public class Codes
        {
            public const string DepartmentalAdmin = "DA";
            public const string KeyMaster = "KM";
            public const string EquipmentMaster = "EM";
            public const string AccessMaster = "AM";

        }
    }
}
