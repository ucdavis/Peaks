using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    // Facilities link deptSpace, flattened
    // ties together rooms and departments
    
    public class Space {

        public Space ()
        {
            Active=true;
        }

        // TODO: decide what we want to do in the absense of an ID
        // We aren't writing to this table so maybe we don't need one?
        public int Id { get; set; }
        public string DeptKey { get; set; }
        public string BldgKey { get; set; }
        public string RoomKey { get; set; }
        public string FloorKey { get; set; }

        public string BldgName { get; set; }
        public string FloorName { get; set; }
        public string RoomNumber { get; set; }
        public string RoomName { get; set; }
        public string RoomCategoryName { get; set; }
        public string RoomCategoryCode { get; set; }

        public string ChartNum { get; set; }
        public string OrgId { get; set; }
        public string DeptName { get; set; }

        // FL or team generated. Maybe lockshop?
        public string Source { get; set; }

        public bool Active { get; set; }

        public int? SqFt { get; set; }

         protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Space>().HasQueryFilter(a => a.Active);
        }
    }
}