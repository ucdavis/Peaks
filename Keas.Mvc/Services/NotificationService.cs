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
        Task KeyAssigned(Serial serial, History history);
        Task KeyUnAssigned(Serial serial, History history);
        Task EquipmentAssigned(Equipment equipment, History history);
        Task EquipmentUnAssigned(Equipment equipment, History history);
        Task AccessAssigned(AccessAssignment accessAssignment, History history, string teamName);
        Task AccessUnAssigned(AccessAssignment accessAssignment, History history, string teamName);
        Task WorkstationCreatedUpdatedInactive(Workstation workstation, History history);
        Task WorkstationAssigned(Workstation workstation, History history);
        Task WorkstationUnAssigned(Workstation workstation, History history);
        Task KeyAccepted(Serial serial, History history);
        Task EquipmentAccepted(Equipment equipment, History history);
        Task WorkstationAccepted(Workstation workstation, History history);
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
            var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task EquipmentCreatedUpdatedInactive(Equipment equipment, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task AccessCreatedUpdatedInactive(Access access, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.AccessMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, access.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task KeyAssigned(Serial serial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, serial.Key.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u == serial.Assignment.Person.User);
            users.Add(assignedTo);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description,
                    NeedsAccept = user == assignedTo,
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task KeyUnAssigned(Serial serial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, serial.Key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();

        }

        public async Task EquipmentAssigned(Equipment equipment, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u == equipment.Assignment.Person.User);
            users.Add(assignedTo);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description,
                    NeedsAccept = user == assignedTo,
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task EquipmentUnAssigned(Equipment equipment, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task AccessAssigned(AccessAssignment accessAssignment, History history, string teamName)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.AccessMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, teamName);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u == accessAssignment.Person.User);
            users.Add(assignedTo);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task AccessUnAssigned(AccessAssignment accessAssignment, History history, string teamName)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.AccessMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, teamName);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task WorkstationCreatedUpdatedInactive(Workstation workstation, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, workstation.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task WorkstationAssigned(Workstation workstation, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, workstation.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u == workstation.Assignment.Person.User);
            users.Add(assignedTo);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task WorkstationUnAssigned(Workstation workstation, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, workstation.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task KeyAccepted(Serial serial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, serial.Key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task EquipmentAccepted(Equipment equipment, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }

        public async Task WorkstationAccepted(Workstation workstation, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, workstation.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    User = user,
                    History = history,
                    Details = history.Description
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();
        }
    }
}

