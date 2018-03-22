using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    // Facilities link rooms, flattened
    public class Room {

        [Key]
        public string RoomKey { get; set; }
        public string BldgKey { get; set; }
        public string FloorKey { get; set; }

        public string BldgName { get; set; }
        public string FloorName { get; set; }
        public string RoomNumber { get; set; }
        public string RoomName { get; set; }
        public string RoomCategoryName { get; set; }
        public string RoomCategoryCode { get; set; }
    }
}