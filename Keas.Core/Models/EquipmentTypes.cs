using System;
using System.Collections.Generic;
using System.Linq;


namespace Keas.Core.Models
{
    public static class EquipmentTypes
    {
        public const string Default = "Default";
        public const string Computer = "Computer";
        public const string Desktop = "Desktop";
        public const string Laptop = "Laptop";
        public const string Server = "Server";
        public const string Cellphone = "Cellphone";
        public const string Device = "Device";
        public const string Tablet = "Tablet";
        public const string Printer = "Printer";
        public const string Card = "Card";
        public const string Industrial = "Industrial";
        public const string Software = "Software";
        public const string Other = "Other";
        public const string Accessory = "Accessory";


        public static List<string> Types = new List<string>
        {
            Default,
            Computer,
            Desktop,
            Laptop,
            Server,
            Cellphone,
            Device,
            Tablet,
            Printer,
            Card,
            Industrial,
            Software,
            Other,
            Accessory,
        }.OrderBy(a => a).ToList();


        public static List<string> MakeAndModelTypes = new List<string>
        {
            Default,
            Computer,
            Desktop,
            Laptop,
            Server,
            Cellphone,
            Device,
            Industrial,
            Other,
            Accessory,
            Printer,
            Tablet,
        };

        public static List<string> Is3Types = new List<string>
        {
            Computer,
            Desktop, 
            Laptop, 
            Server, 
            Cellphone, 
            Device,
            Tablet,
        };

        public static List<string> BigfixTypes = new List<string>
        {
            Computer,
            Desktop,
            Laptop,
            Server,
        };
    }
}
