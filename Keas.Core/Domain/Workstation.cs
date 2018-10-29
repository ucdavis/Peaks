using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Workstation : AssetBase
    {
        public Workstation()
        {
            Attributes = new List<WorkstationAttribute>();
        }

        // Desk Table ???
        public string Type { get; set; }
        
        public Space Space { get; set; }
        public int SpaceId { get; set; }
        
        public WorkstationAssignment Assignment { get; set; }
        public int? WorkstationAssignmentId { get; set; }

        public List<WorkstationAttribute> Attributes { get; set; }

        public void AddAttribute(string key, string value)
        {
            Attributes.Add(new WorkstationAttribute { Workstation = this, Key = key, Value = value });
        }

         protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Workstation>().HasQueryFilter(a => a.Active);
        }
    }
}