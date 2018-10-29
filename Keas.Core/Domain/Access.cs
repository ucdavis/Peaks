using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Access : AssetBase {
        public Access()
        {
            Assignments = new List<AccessAssignment>();
        }
        public List<AccessAssignment> Assignments { get; set; }


         protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Access>().HasQueryFilter(a => a.Active);
        }
       
    }
}