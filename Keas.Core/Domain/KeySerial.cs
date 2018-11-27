using System;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class KeySerial : AssetBase
    {

        public KeySerial()
        {
            Active = true;
        }

        public string Number { get; set; }

        public Key Key { get; set; }

        public int KeyId { get; set; }

        public KeySerialAssignment KeySerialAssignment { get; set; }

        public int? KeySerialAssignmentId { get; set; }

        public override string Title => Name ?? Number;

        protected internal static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<KeySerial>()
                .HasOne(s => s.KeySerialAssignment)
                .WithOne(a => a.KeySerial)
                .HasForeignKey<KeySerialAssignment>(a => a.KeySerialId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
