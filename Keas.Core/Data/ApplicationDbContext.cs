using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }
        
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Team> Teams { get; set; }
        public virtual DbSet<TeamMembership> TeamMemberships { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<Access> Access { get; set; }
        public virtual DbSet<AccessAssignment> AccessAssignments { get; set; }
        
        public virtual DbSet<Key> Keys { get; set; }
        public virtual DbSet<KeyAssignment> KeyAssignments { get; set; }
        public virtual DbSet<Equipment> Equipment { get; set; }
        public virtual DbSet<EquipmentAssignment> EquipmentAssignments { get; set; }
        public virtual DbSet<EquipmentAttribute> EquipmentAttributes { get; set; }
    }
}