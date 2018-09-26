using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    public class EmailSettings
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
    }
}
