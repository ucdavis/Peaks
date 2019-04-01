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
        Task KeySerialCreatedUpdatedInactive(KeySerial keySerial, History history);
        Task EquipmentCreatedUpdatedInactive(Equipment equipment, History history);
        Task AccessCreatedUpdatedInactive(Access access, History history);
        Task KeySerialAssigned(KeySerial keySerial, History history);
        Task KeySerialUnAssigned(KeySerial keySerial , History history);
        Task EquipmentAssigned(Equipment equipment, History history);
        Task EquipmentUnAssigned(Equipment equipment, History history);
        Task AccessAssigned(AccessAssignment accessAssignment, History history, string teamName);
        Task AccessUnAssigned(AccessAssignment accessAssignment, History history, string teamName);
        Task WorkstationCreatedUpdatedInactive(Workstation workstation, History history);
        Task WorkstationAssigned(Workstation workstation, History history);
        Task WorkstationUnAssigned(Workstation workstation, History history);
        Task KeySerialAccepted(KeySerial keySerial, History history);
        Task EquipmentAccepted(Equipment equipment, History history);
        Task WorkstationAccepted(Workstation workstation, History history);

        Task PersonUpdated(Person person, Team team, string teamSlug, string actorName, string actorId, string action, string notes);
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = key.TeamId,
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = equipment.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = access.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task KeySerialAssigned(KeySerial keySerial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, keySerial.Key.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u.Id == keySerial.KeySerialAssignment.Person.UserId);
            if (!users.Contains(assignedTo)){
                users.Add(assignedTo);
            }
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    NeedsAccept = user == assignedTo,
                    TeamId = keySerial.Key.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task KeySerialUnAssigned(KeySerial keySerial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, keySerial.Key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = keySerial.Key.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }

        }

        public async Task EquipmentAssigned(Equipment equipment, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.EquipmentMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, equipment.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u.Id == equipment.Assignment.Person.UserId);
            if (!users.Contains(assignedTo)){
                users.Add(assignedTo);
            } 
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    NeedsAccept = user == assignedTo,
                    TeamId = equipment.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = equipment.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task AccessAssigned(AccessAssignment accessAssignment, History history, string teamName)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.AccessMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, teamName);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u.Id == accessAssignment.Person.UserId);
            if (!users.Contains(assignedTo)){
                users.Add(assignedTo);
            }
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,                    
                };
                var team = await _dbContext.Teams.SingleOrDefaultAsync(a => a.Slug == teamName);
                if (team != null)
                {
                    notification.TeamId = team.Id;
                }
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description
                };
                var team = await _dbContext.Teams.SingleOrDefaultAsync(a => a.Slug == teamName);
                if (team != null)
                {
                    notification.TeamId = team.Id;
                }
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = workstation.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task WorkstationAssigned(Workstation workstation, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.SpaceMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, workstation.TeamId);
            var assignedTo = await _dbContext.Users.SingleAsync(u => u.Id == workstation.Assignment.Person.UserId);
            if (!users.Contains(assignedTo)){
                users.Add(assignedTo);
            } 
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = workstation.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = workstation.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task KeySerialAccepted(KeySerial keySerial, History history)
        {
            var roles = await _dbContext.Roles
                .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, keySerial.Key.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = keySerial.Key.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = equipment.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
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
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = workstation.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
        }

        public async Task PersonUpdated(Person person, Team team, string teamSlug, string actorName, string actorId, string action, string notes)
        {
            if (team == null)
            {
                team = await _dbContext.Teams.SingleAsync(a => a.Slug == teamSlug);
            }

            var personNotification = new PersonNotification
            {
                Action = action,
                ActorName = actorName,
                ActorId = actorId,
                NotificationEmail = team.BoardingNotificationEmail,
                Pending = true,
                PersonEmail = person.Email,
                PersonName = person.Name,
                PersonId = person.Id,
                TeamId = team.Id,
                Notes = notes,
            };
            await _dbContext.PersonNotifications.AddAsync(personNotification);
        }
    }
}


            await _dbContext.SaveChangesAsync();
        }

        // Assume we email all Team KeyMasters & DepartmentalAdmins
        public async Task KeySerialCreatedUpdatedInactive(KeySerial keySerial, History history)
        {
            var roles = await _dbContext.Roles
                    .Where(r => r.Name == Role.Codes.DepartmentalAdmin || r.Name == Role.Codes.KeyMaster).ToListAsync();
            var users = await _securityService.GetUsersInRoles(roles, keySerial.TeamId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    History = history,
                    Details = history.Description,
                    TeamId = keySerial.TeamId,
                };
                _dbContext.Notifications.Add(notification);
            }
            await _dbContext.SaveChangesAsync();