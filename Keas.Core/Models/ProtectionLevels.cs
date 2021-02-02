using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    //Maybe some kind of ketValue pair for the description?
    public static class ProtectionLevels
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
            P4
        };
    }
    public static class AvailabilityLevels
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
            A4
        };
    }
}
