using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Helpers
{
    public class ClientLogMessage
    {
        public long Timestamp { get; set; }

        public string Level { get; set; }

        public string Message { get; set; }

        public string Url { get; set; }

        public string Exception { get; set; }
    }
}
