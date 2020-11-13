using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Models
{
    public class DocumentTemplateInfo
    {
        public int TeamId { get; set; }
        public string TemplateId { get; set; }
        public string Name { get; set; }
        public string AccountId { get; set; }
        public string ApiBasePath { get; set; }
    }
}
