using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public static class EquipmentAvailabilityLevels
    {
        public const string A1 = "A1";
        public const string A2 = "A2";
        public const string A3 = "A3";
        public const string A4 = "A4";

        public static List<string> Levels = new List<string>
        {
            A1,
            A2,
            A3,
            A4,
        };
    }
}
