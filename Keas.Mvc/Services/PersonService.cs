using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace Keas.Mvc.Services
{
    public interface IPersonService
    {
        Task<(Person Person, int peopleCount)> GetOrCreateFromKerberos(string kerb, int teamId);
    }

    public class PersonService : IPersonService
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdentityService _identityService;
        public PersonService(ApplicationDbContext context, IIdentityService identityService)
        {
            _context = context;
            _identityService = identityService;
        }

        public async Task<(Person Person, int peopleCount)> GetOrCreateFromKerberos(string kerb, int teamId)
        {
            var user = await _context.Users.Include(u => u.People).IgnoreQueryFilters().Where(u => u.Id == kerb).FirstOrDefaultAsync();
            if (user == null)
            {
                //User does not exist, create, add to team
                user = await _identityService.GetByKerberos(kerb);
                if (user != null)
                {
                    _context.Users.Add(user);
                    var person = CreatePersonFromUser(user, teamId);
                    _context.People.Add(person);
                    await _context.SaveChangesAsync();
                    return (person, 1);
                }
                else
                {
                    // No user found, return null
                    return (null, 0);
                }
            }
            else
            {
                //User found. Check if in team, add if not
                var person = user.People.FirstOrDefault(p => p.TeamId == teamId);
                if (person != null)
                {
                    //Person already in team, activate if needed
                    if (!person.Active)
                    {
                        person.Active = true;
                        await _context.SaveChangesAsync();
                        return (person, 1);
                    }
                    return (person, 0);
                }
                else
                {
                    // Need to create person
                    person = CreatePersonFromUser(user, teamId);
                    _context.People.Add(person);
                    await _context.SaveChangesAsync();
                    return (person, 1);
                }
            }
        }

        private Person CreatePersonFromUser(User user, int teamId)
        {
            var person = new Person();
            person.User = user;
            person.FirstName = user.FirstName;
            person.LastName = user.LastName;
            person.Email = user.Email;
            person.Active = true;
            person.TeamId = teamId;
            return person;

        }


    }
}