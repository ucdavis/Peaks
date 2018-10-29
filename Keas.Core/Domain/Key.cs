using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Key : AssetBase {
        
        public string Number { get; set; }

        public List<KeyXSpace> KeyXSpaces { get; set; }

        public List<Serial> Serials { get; set; }


         protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Key>().HasQueryFilter(a => a.Active);
        }
    }
}