using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class Role
    {
        public Role()
        {
            IsAdmin = false;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public bool IsAdmin { get; set; }

        public class Codes
        {
            public const string DepartmentalAdmin = "DepartmentalAdmin";
            public const string KeyMaster = "KeyMaster";
            public const string EquipmentMaster = "EquipMaster";
            public const string AccessMaster = "AccessMaster";
            public const string Admin = "Admin";
            //public const string EmulationUser = "EmulationUser"; Not working, so don't add!

        }
    }
}
