using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;

namespace Keas.Mvc.Helpers
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialzied

            var user = new User {Id = "123124", Name = "Scott Kirkland", Email = "scott@email.com"};

            context.Users.Add(user);

            context.SaveChanges();
            
        }
    }
}