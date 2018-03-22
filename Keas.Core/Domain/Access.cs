using System.Collections.Generic;

namespace Keas.Core.Domain
{
    public class Access : AssetBase {
        public Access()
        {
            Assignments = new List<AccessAssignment>();
        }
        public List<AccessAssignment> Assignments { get; set; }
    }
}