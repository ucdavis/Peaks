using Keas.Core.Data;
using Keas.Core.Domain;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface IUserService
    {
        Task<User> CreateUserFromEmail(string email);
        Task<User> CreateUserFromKerberos(string kerb);
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

       public async Task<User> CreateUserFromEmail(string email){
            var userSearch = await _identityService.GetByEmail(email); 
            return await CreateUser(userSearch); 
       }

       public async Task<User> CreateUserFromKerberos(string kerb){
           var userSearch = await _identityService.GetByKerberos(kerb); 
           return await CreateUser(userSearch);                 
       }

       public async Task<User> CreateUser(User userSearch){
            var newUser = new User
                {
                    Id = userSearch.Id,
                    FirstName = userSearch.FirstName,
                    LastName = userSearch.LastName,
                    Email = userSearch.Email
                };
            _context.Users.Add(newUser); 
            await _context.SaveChangesAsync(); 
            return newUser;
       }
    }    
}