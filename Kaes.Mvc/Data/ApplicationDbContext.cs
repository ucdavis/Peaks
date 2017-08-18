using Microsoft.EntityFrameworkCore;

namespace Kaes.Mvc.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext (DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Kaes.Mvc.Domain.Sample> Sample { get; set; }
    }
}
