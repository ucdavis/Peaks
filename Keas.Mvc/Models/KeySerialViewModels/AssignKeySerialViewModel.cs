using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models.KeySerialViewModels
{
    public class AssignKeySerialViewModel
    {
        public int KeySerialId { get; set; }

        public int PersonId { get; set; }

        public DateTime ExpiresAt { get; set; }
    }
}
