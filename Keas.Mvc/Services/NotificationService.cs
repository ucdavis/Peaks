using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface INotificationService
    {
        Task KeyCreatedUpdatedInactive(Key key, History history);
        Task EquipmentCreatedUpdatedInactive(Equipment equipment, History history);
        Task AccessCreatedUpdatedInactive(Access access, History history);

    }
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ISecurityService _securityService;

        public NotificationService(ApplicationDbContext dbContext, ISecurityService securityService)
        {
            _dbContext = dbContext;
            _securityService = securityService;
        }

        // Assume we email all Team KeyMasters & DepartmentalAdmins
        public async Task KeyCreatedUpdatedInactive(Key key, History history)
        {
            var roles = _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToList();
            var users = await _securityService.GetUsersInRoles(roles, key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = string.Format("{0} By {1}.", history.Description, history.Actor.Name)
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task EquipmentCreatedUpdatedInactive(Equipment equipment, History history)
        {
            var roles = _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToList();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = string.Format("{0} By {1}.", history.Description, history.Actor.Name)
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task AccessCreatedUpdatedInactive(Access access, History history)
        {
            var roles = _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.AccessMaster).ToList();
            var users = await _securityService.GetUsersInRoles(roles, access.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = string.Format("{0} By {1}.", history.Description, history.Actor.Name)
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task KeyAssigned(Key key, History history)
        {
            var roles = _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToList();
            var users = await _securityService.GetUsersInRoles(roles, key.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u == key.Assignment.Person.User);
            users.Add(assignedTo);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = string.Format("{0} By {1}.", history.Description, history.Actor.Name)
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }


    }
}

