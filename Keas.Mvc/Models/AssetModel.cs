using System.Collections.Generic;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class AssetModel
    {
        public Team Team { get; set; }

        public List<string> Tags { get; set; }
        public string[] Permissions { get; set; }
    }
}