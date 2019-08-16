using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public static class EquipmentProtectionLevels
    {
        public const string P1 = "P1";
        public const string P2 = "P2";
        public const string P3 = "P3";
        public const string P4 = "P4";

        public static List<string> Levels = new List<string>
        {
            P1,
            P2,
            P3,
            P4,
        };
    }
}
