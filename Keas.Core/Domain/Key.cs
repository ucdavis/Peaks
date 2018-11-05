using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Key : AssetBase
    {
        public string Code { get; set; }

        public List<KeyXSpace> KeyXSpaces { get; set; }

        public List<KeySerial> Serials { get; set; }


        protected internal static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Key>().HasQueryFilter(a => a.Active);
        }
    }
}