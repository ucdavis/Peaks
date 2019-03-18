using System.Collections.Generic;


namespace Keas.Core.Models
{
    public static class EquipmentTypes
    {
        public const string Default = "Default";
        public const string Computer = "Computer";
        public const string Laptop = "Laptop";
        public const string Cellphone = "Cellphone";
        public const string Device = "Device";
        public const string Card = "Card";
        public const string Industrial = "Industrial";
        public const string Other = "Other";


        public static List<string> Types = new List<string>
        {
            Default,
            Computer,
            Laptop,
            Cellphone,
            Device,
            Card,
            Industrial,
            Other,
        };
    }
}
