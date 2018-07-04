using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Keas.Core.Domain
{
    // Facilities link deptSpace, flattened
    // ties together rooms and departments
    public class Space {
        // TODO: decide what we want to do in the absense of an ID
        // We aren't writing to this table so maybe we don't need one?
        public int Id { get; set; }
        public string DeptKey { get; set; }
        public string RoomKey { get; set; }
        
        [ForeignKey("RoomKey")]
        public Room Room { get; set; }
        public string ChartNum { get; set; }
        public string OrgId { get; set; }
        public string DeptName { get; set; }
    }
}