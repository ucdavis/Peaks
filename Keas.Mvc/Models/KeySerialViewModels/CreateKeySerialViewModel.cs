using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.KeySerialViewModels
{
    public class CreateKeySerialViewModel
    {
        public int KeyId { get; set; }

        public string Number { get; set; }

        public string Status { get; set; }
    }
}
