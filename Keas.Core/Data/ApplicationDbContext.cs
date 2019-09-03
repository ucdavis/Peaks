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
       
        public virtual DbSet<Person> People { get; set; }

        public virtual DbSet<Access> Access { get; set; }
        public virtual DbSet<AccessAssignment> AccessAssignments { get; set; }
        
        public virtual DbSet<Key> Keys { get; set; }
        public virtual DbSet<KeyXSpace> KeyXSpaces { get; set; }
        public virtual DbSet<KeySerial> KeySerials { get; set; }
        public virtual DbSet<KeySerialAssignment> KeySerialAssignments { get; set; }

        public virtual DbSet<Equipment> Equipment { get; set; }
        public virtual DbSet<EquipmentAssignment> EquipmentAssignments { get; set; }
        public virtual DbSet<EquipmentAttribute> EquipmentAttributes { get; set; }

        public virtual DbSet<FinancialOrganization> FISOrgs  { get; set; }
        public virtual DbSet<TeamPpsDepartment> TeamPpsDepartments { get; set; }

        public virtual  DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<PersonNotification> PersonNotifications { get; set; }

        public virtual DbSet<Workstation> Workstations { get; set; }
        public virtual DbSet<WorkstationAssignment> WorkstationAssignments { get; set; }
        public virtual DbSet<WorkstationAttribute> WorkstationAttributes { get; set; }

        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<TeamPermission> TeamPermissions { get; set; }
        public virtual DbSet<SystemPermission> SystemPermissions { get; set; }

        public virtual DbSet<History> Histories { get; set; }

        // Facilities link import tables
        public virtual DbSet<Space> Spaces { get; set; }

        public virtual DbSet<Tag> Tags { get; set; }

        public virtual DbSet<Group> Groups { get; set; }
        public virtual DbSet<GroupPermission> GroupPermissions { get; set; }
        public virtual DbSet<GroupXTeam> GroupXTeams { get; set; }

        public virtual DbSet<ExtendedPersonView> ExtendedPersonViews { get; set; }
        public virtual DbSet<EquipmentAttributeKey> EquipmentAttributeKeys { get; set; }
        

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            AccessAssignment.OnModelCreating(builder);
            Domain.Access.OnModelCreating(builder);
            Domain.Equipment.OnModelCreating(builder);
            Key.OnModelCreating(builder);
            KeySerial.OnModelCreating(builder);
            Person.OnModelCreating(builder);
            Space.OnModelCreating(builder);
            Workstation.OnModelCreating(builder);
        }
    }
}
