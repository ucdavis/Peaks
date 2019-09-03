using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Core.Resources
{
    public static class KeySerialStatusModel
    {
        public const string Active = "Active";
        public const string Lost = "Lost";
        public const string Destroyed = "Destroyed";
        public const string Special = "Special"; //To be used when a key is assigned to someone who doesn't have a kerb
        public const string DogAte = "Dog ate";

        public static List<string> StatusList = new List<string>
        {
            Active,
            Lost,
            Destroyed,
            Special,
            DogAte,
        };
    }
}
