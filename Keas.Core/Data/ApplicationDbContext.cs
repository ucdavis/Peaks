using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Data
{
    public class ApplicationDbContext
    {
        public virtual DbSet<User> Users { get; set; }
    }
}