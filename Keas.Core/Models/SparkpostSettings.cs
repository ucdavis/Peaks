using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    public class SparkpostSettings
    {
        public string ApiKey { get; set; }
        public string DisableSend { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
    }
}
