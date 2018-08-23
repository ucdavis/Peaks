using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public class Key : AssetBase {
        
        public string Number { get; set; }

        public List<KeyXSpace> KeyXSpaces { get; set; }

        public List<Serial> Serials { get; set; }
    }
}