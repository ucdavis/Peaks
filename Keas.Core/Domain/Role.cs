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
            public const string DepartmentalAdmin = "DepartmentalAdmin";
            public const string KeyMaster = "KeyMaster";
            public const string EquipmentMaster = "EquipmentMaster";
            public const string AccessMaster = "AccessMaster";

        }
    }
}
