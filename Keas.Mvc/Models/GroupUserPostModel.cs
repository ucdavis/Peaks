using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class GroupUserPostModel
    {
        public Group Group { get; set; }
        public string UserEmail { get; set; }
    }
}
