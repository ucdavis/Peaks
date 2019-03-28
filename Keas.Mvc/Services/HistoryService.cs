using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Services
{
    public interface IHistoryService
    {
        Task<History> KeyCreated(Key key);
        Task<History> KeySerialCreated(KeySerial keySerial);
        Task<History> AccessCreated(Access access);
        Task<History> EquipmentCreated(Equipment equipment);
        Task<History> KeyUpdated(Key key);
        Task<History> KeySerialUpdated(KeySerial keySerial);
        Task<History> AccessUpdated(Access access);
        Task<History> EquipmentUpdated(Equipment equipment);
        Task<History> KeyInactivated(Key key);
        Task<History> AccessInactivated(Access access);
        Task<History> EquipmentInactivated(Equipment equipment);
        Task<History> KeySerialAssigned(KeySerial keySerial);
        Task<History> AccessAssigned(AccessAssignment accessAssignment);
        Task<History> EquipmentAssigned(Equipment equipment);
        Task<History> KeySerialUnassigned(KeySerial keySerial);
        Task<History> AccessUnassigned(AccessAssignment accessAssignment);
        Task<History> EquipmentUnassigned(Equipment equipment);
        Task<History> KeySerialAccepted(KeySerial keySerial);
        Task<History> AccessAccepted(Access access);
        Task<History> EquipmentAccepted(Equipment equipment);
        Task<History> WorkstationCreated(Workstation workstation);
        Task<History> WorkstationUpdated(Workstation workstation);
        Task<History> WorkstationInactivated(Workstation workstation);
        Task<History> WorkstationAssigned(Workstation workstation);
        Task<History> WorkstationUnassigned(Workstation workstation);
        Task<History> WorkstationAccepted(Workstation workstation);

        Task<History> KeyDeleted(Key key);
        Task<History> AccessDeleted(Access access);
        Task<History> EquipmentDeleted(Equipment equipment);
        Task<History> WorkstationDeleted(Workstation workstation);

        Task<History> KeySerialAssignmentUpdated(KeySerial keySerial);
        Task<History> AccessAssignmentUpdated(AccessAssignment accessAssignment);
        Task<History> EquipmentAssignmentUpdated(Equipment equipment);
        Task<History> WorkstationAssignmentUpdated(Workstation workstation);


    }

    public class HistoryService : IHistoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISecurityService _securityService;


        public HistoryService(ApplicationDbContext context, ISecurityService securityService)
        {
            _context = context;
            _securityService = securityService;
        }

        public async Task<History> KeyCreated(Key key)
        {
            var person = await _securityService.GetPerson(key.TeamId);
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(Key), key.Title, person, "Created"),
                ActorId = person.UserId,
                AssetType = "Key",
                ActionType = "Created",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialCreated(KeySerial keySerial)
        {
            var person = await _securityService.GetPerson(keySerial.TeamId);
            var historyEntry = new History
            {
                Description = keySerial.GetDescription(nameof(KeySerial), $"{keySerial.Key.Title}-{keySerial.Title}", person, "Created"),
                ActorId = person.UserId,
                AssetType = "KeySerial",
                ActionType = "Created",
                KeySerial = keySerial,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessCreated(Access access)
        {
            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(Access), access.Title, person, "Created"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Created",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentCreated(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(Equipment), equipment.Title, person, "Created"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Created",
                Equipment = equipment,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyUpdated(Key key)
        {
            var person = await _securityService.GetPerson(key.TeamId);
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(Key), key.Title, person, "Updated"),
                ActorId = person.UserId,
                AssetType = "Key",
                ActionType = "Updated",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> KeySerialUpdated(KeySerial keySerial)
        {
            var person = await _securityService.GetPerson(keySerial.TeamId);
            var historyEntry = new History
            {
                Description = keySerial.GetDescription(nameof(KeySerial), $"{keySerial.Key.Title}-{keySerial.Title}", person, "Updated"),
                ActorId = person.UserId,
                AssetType = "KeySerial",
                ActionType = "Updated",
                KeySerial = keySerial
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUpdated(Access access)
        {
            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(Access), access.Title, person, "Updated"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Updated",
                Access = access,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentUpdated(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(Equipment), equipment.Title, person, "Updated"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Updated",
                Equipment = equipment,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> KeyInactivated(Key key)
        {
            var person = await _securityService.GetPerson(key.TeamId);
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(Key), key.Title, person, "Inactivated"),
                ActorId = person.UserId,
                AssetType = "Key",
                ActionType = "Inactivated",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessInactivated(Access access)
        {
            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(Access), access.Title, person, "Inactivated"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Inactivated",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentInactivated(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(Equipment), equipment.Title, person, "Inactivated"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Inactivated",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialAssigned(KeySerial keySerial)
        {
            var key = await _context.Keys.Where(k => k.Id == keySerial.KeyId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(key.Team.Slug);
            var historyEntry = new History
            {
                Description = keySerial.KeySerialAssignment.GetDescription(nameof(KeySerial), $"{keySerial.Key.Title}-{keySerial.Title}", person, "Assigned to"),
                ActorId = person.UserId,
                AssetType = "KeySerial",
                ActionType = "Assigned",
                KeySerialId = keySerial.Id,
                TargetId = keySerial.KeySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAssigned(AccessAssignment accessAssignment)
        {
            var access = await _context.Access.Where(a => a.Id == accessAssignment.AccessId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(access.Team.Slug);
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(Access), access.Title, person, "Assigned to"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Assigned",
                AccessId = accessAssignment.AccessId,
                TargetId = accessAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentAssigned(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(Equipment), equipment.Title, person, "Assigned to"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Assigned",
                Equipment = equipment,
                TargetId = equipment.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialUnassigned(KeySerial keySerial)
        {
            var key = await _context.Keys.Where(k => k.Id == keySerial.KeyId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(key.TeamId);
            var historyEntry = new History
            {
                Description = keySerial.KeySerialAssignment.GetDescription(nameof(KeySerial), $"{keySerial.Key.Title}-{keySerial.Title}", person, "Unassigned from"),
                ActorId = person.UserId,
                AssetType = "KeySerial",
                ActionType = "Unassigned",
                KeySerialId = keySerial.Id,
                TargetId = keySerial.KeySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUnassigned(AccessAssignment accessAssignment)
        {
            var access = await _context.Access.Where(x => x.Id == accessAssignment.AccessId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(Access), access.Title, person, "Unassigned from"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Unassigned",
                AccessId = accessAssignment.AccessId,
                TargetId = accessAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentUnassigned(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(Equipment), equipment.Title, person, "Unassigned from"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Unassigned",
                Equipment = equipment,
                TargetId = equipment.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialAccepted(KeySerial keySerial)
        {
            var key = await _context.Keys.Where(k => k.Id == keySerial.KeyId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(key.Team.Slug);
            var historyEntry = new History
            {
                Description = keySerial.Key.GetDescription(nameof(Key), key.Title, person, "Accepted"),
                ActorId = person.UserId,
                AssetType = "Key",
                ActionType = "Accepted",
                Key = keySerial.Key,
                KeySerial = keySerial,
                TargetId = keySerial.KeySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAccepted(Access access)
        {
            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(Access), access.Title, person, "Accepted"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Accepted",
                Access = access,
                //TargetId = null //TODO: Get and set? Currently this method isn't being called.
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentAccepted(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(Equipment), equipment.Title, person, "Accepted"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Accepted",
                Equipment = equipment,
                TargetId = equipment.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationCreated(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(Workstation), workstation.Title, person, "Created"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Created",
                Workstation = workstation,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationUpdated(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(Workstation), workstation.Title, person, "Updated"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Updated",
                Workstation = workstation,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationInactivated(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(Workstation), workstation.Title, person, "Inactivated"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Inactivated",
                Workstation = workstation
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationAssigned(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(Workstation), workstation.Title, person, "Assigned to"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Assigned",
                Workstation = workstation,
                TargetId = workstation.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationUnassigned(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(Workstation), workstation.Title, person, "Unassigned from"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Unassigned",
                Workstation = workstation,
                TargetId = workstation.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> WorkstationAccepted(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(Workstation), workstation.Title, person, "Accepted"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Accepted",
                Workstation = workstation,
                TargetId = workstation.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyDeleted(Key key)
        {
            var person = await _securityService.GetPerson(key.TeamId);
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(Key), key.Title, person, "Deleted"),
                ActorId = person.UserId,
                AssetType = "Key",
                ActionType = "Deleted",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> AccessDeleted(Access access)
        {

            var person = await _securityService.GetPerson(access.TeamId);
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(Access), access.Title, person, "Deleted"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "Deleted",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> EquipmentDeleted(Equipment equipment)
        {

            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(Equipment), equipment.Title, person, "Deleted"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "Deleted",
                Equipment = equipment,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> WorkstationDeleted(Workstation workstation)
        {

            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(Workstation), workstation.Title, person, "Deleted"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "Deleted",
                Workstation = workstation,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialAssignmentUpdated(KeySerial keySerial)
        {
            var key = await _context.Keys.Where(k => k.Id == keySerial.KeyId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(key.Team.Slug);
            var historyEntry = new History
            {
                Description = keySerial.KeySerialAssignment.GetDescription(nameof(KeySerial), $"{keySerial.Key.Title}-{keySerial.Title}", person, "Assignment Updated for"),
                ActorId = person.UserId,
                AssetType = "KeySerial",
                ActionType = "AssignmentUpdated",
                KeySerial = keySerial,
                TargetId = keySerial.KeySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> AccessAssignmentUpdated(AccessAssignment accessAssignment)
        {
            var access = await _context.Access.Where(a => a.Id == accessAssignment.AccessId).Include(t => t.Team).SingleAsync();
            var person = await _securityService.GetPerson(access.Team.Slug);
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(Access), access.Title, person, "Assignment Updated for"),
                ActorId = person.UserId,
                AssetType = "Access",
                ActionType = "AssignmentUpdated",
                AccessId = accessAssignment.AccessId,
                TargetId = accessAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> EquipmentAssignmentUpdated(Equipment equipment)
        {
            var person = await _securityService.GetPerson(equipment.TeamId);
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(Equipment), equipment.Title, person, "Assignment Updated for"),
                ActorId = person.UserId,
                AssetType = "Equipment",
                ActionType = "AssignmentUpdated",
                Equipment = equipment,
                TargetId = equipment.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> WorkstationAssignmentUpdated(Workstation workstation)
        {
            var person = await _securityService.GetPerson(workstation.TeamId);
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(Workstation), workstation.Title, person, "Assignment Updated for"),
                ActorId = person.UserId,
                AssetType = "Workstation",
                ActionType = "AssignmentUpdated",
                Workstation = workstation,
                TargetId = workstation.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
    }
}

