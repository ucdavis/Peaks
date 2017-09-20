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
    }
}