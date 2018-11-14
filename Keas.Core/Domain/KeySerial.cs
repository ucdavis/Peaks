using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class KeySerial
    {

        public KeySerial()
        {
            Active = true;
        }

        [Key]
        public int Id { get; set; }

        public Key Key { get; set; }
        public int KeyId { get; set; }

        public string Number { get; set; }

        public KeySerialAssignment KeySerialAssignment { get; set; }

        public int? KeySerialAssignmentId { get; set; }

        public bool Active { get; set; }

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
