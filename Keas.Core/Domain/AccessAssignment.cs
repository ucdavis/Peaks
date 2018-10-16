using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class AccessAssignment : AssignmentBase {
        public int AccessId { get; set; }
        public Access Access { get; set; }

        protected internal  static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<AccessAssignment>().HasOne(a => a.Person).WithMany(a => a.AccessAssignments).OnDelete(DeleteBehavior.Cascade);
            builder.Entity<AccessAssignment>().HasOne(a => a.Access).WithMany(a => a.Assignments).OnDelete(DeleteBehavior.Restrict);
        }
    }
}