using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class KeySerialAssignment : AssignmentBase
    {
        public int KeySerialId { get; set; }

        public KeySerial KeySerial { get; set; }
    }
}