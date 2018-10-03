using Keas.Core.Data;
using Keas.Core.Domain;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface IUserService
    {
        Task CreateUserFromEmail(string email);
        Task CreateUserFromKerberos(string kerb);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        public UserService(ApplicationDbContext context, IIdentityService identityService)
        {
            _context = context;
            _identityService = identityService;
        }

       public async Task CreateUserFromEmail(string email){
            var userSearch = await _identityService.GetByEmail(email); 
             await CreateUser(userSearch); 
       }

       public async Task CreateUserFromKerberos(string kerb){
           var userSearch = await _identityService.GetByKerberos(kerb); 
           await CreateUser(userSearch);                 
       }

       public async Task CreateUser(User userSearch){
            var newUser = new User
                {
                    Id = userSearch.Id,
                    FirstName = userSearch.FirstName,
                    LastName = userSearch.LastName,
                    Email = userSearch.Email
                };
            _context.Users.Add(newUser); 
            await _context.SaveChangesAsync(); 
       }
    }    
}