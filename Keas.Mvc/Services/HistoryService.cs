using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface IHistoryService
    {
        Task<History> KeyCreated(Key key);
        Task<History> AccessCreated(Access access);
        Task<History> EquipmentCreated(Equipment equipment);
        Task<History> KeyUpdated(Key key);
        Task<History> AccessUpdated(Access access);
        Task<History> EquipmentUpdated(Equipment equipment);
        Task<History> KeyInactivated(Key key);
        Task<History> AccessInactivated(Access access);
        Task<History> EquipmentInactivated(Equipment equipment);
        Task<History> KeySerialAssigned(KeySerialAssignment keySerialAssignment);
        Task<History> AccessAssigned(AccessAssignment accessAssignment);
        Task<History> EquipmentAssigned(Equipment equipment);
        Task<History> KeySerialUnassigned(KeySerialAssignment keySerialAssignment);
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

        Task<History> KeySerialAssignmentUpdated(KeySerialAssignment keySerialAssignment);
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(key), key.Title, user, "Created"),
                ActorId = user.Id,
                AssetType = "Key",
                ActionType = "Created",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessCreated(Access access)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(access), access.Title, user, "Created"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(equipment), equipment.Title, user, "Created"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(key), key.Title, user, "Updated"),
                ActorId = user.Id,
                AssetType = "Key",
                ActionType = "Updated",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUpdated(Access access)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(access), access.Title, user, "Updated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(equipment), equipment.Title, user, "Updated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(key), key.Title, user, "Inactivated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(access), access.Title, user, "Inactivated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(equipment), equipment.Title, user, "Inactivated"),
                ActorId = user.Id,
                AssetType = "Equipment",
                ActionType = "Inactivated",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialAssigned(KeySerialAssignment keySerialAssignment)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = keySerialAssignment.GetDescription(nameof(KeySerialAssignment), keySerialAssignment.KeySerial.Key.Title, user, "Assigned", keySerialAssignment.Person.Name),
                ActorId = user.Id,
                AssetType = "KeySerial",
                ActionType = "Assigned",
                KeySerialId = keySerialAssignment.KeySerialId,
                TargetId = keySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAssigned(AccessAssignment accessAssignment)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(accessAssignment.Access), accessAssignment.Access.Title, user, "Assigned", accessAssignment.Person.Name) ,
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(equipment), equipment.Title, user, "Assigned", equipment.Assignment.Person.Name) ,
                ActorId = user.Id,
                AssetType = "Equipment",
                ActionType = "Assigned",
                Equipment = equipment,
                TargetId = equipment.Assignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialUnassigned(KeySerialAssignment keySerialAssignment)
        {
            var keySerial = keySerialAssignment.KeySerial;

            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = keySerialAssignment.GetDescription(nameof(KeySerial), keySerial.Title, user, "Unassigned", keySerialAssignment.Person.Name),
                ActorId = user.Id,
                AssetType = "KeySerial",
                ActionType = "Unassigned",
                KeySerialId = keySerial.Id,
                TargetId = keySerialAssignment.PersonId
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUnassigned(AccessAssignment accessAssignment)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(accessAssignment.Access), accessAssignment.Access.Title, user, "Unassigned", accessAssignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(equipment), equipment.Title, user, "Unassigned", equipment.Assignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = keySerial.Key.GetDescription(nameof(KeySerial), keySerial.Title, user, "Accepted"),
                ActorId = user.Id,
                AssetType = "KeySerial",
                ActionType = "Accepted",
                KeySerial = keySerial,
                TargetId = keySerial.KeySerialAssignment.PersonId,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAccepted(Access access)
        {
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(access), access.Title, user, "Accepted") ,
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(equipment), equipment.Title, user, "Accepted"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(workstation), workstation.Title, user, "Created"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(workstation), workstation.Title, user, "Updated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(workstation), workstation.Title, user, "Inactivated"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(workstation.Assignment), workstation.Title, user, "Assigned", workstation.Assignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(workstation), workstation.Title, user, "Unassigned", workstation.Assignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(workstation), workstation.Title, user, "Accepted"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = key.GetDescription(nameof(key), key.Title, user, "Deleted"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = access.GetDescription(nameof(access), access.Title, user, "Deleted"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.GetDescription(nameof(equipment), equipment.Title, user, "Deleted"),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.GetDescription(nameof(workstation), workstation.Title, user, "Deleted"),
                ActorId = user.Id,
                AssetType = "Workstation",
                ActionType = "Deleted",
                Workstation = workstation,
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeySerialAssignmentUpdated(KeySerialAssignment keySerialAssignment)
        {
            var keySerial = keySerialAssignment.KeySerial;

            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = keySerialAssignment.GetDescription(nameof(keySerial.Key), keySerial.Title, user, "Assignment Updated", keySerialAssignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = accessAssignment.GetDescription(nameof(accessAssignment.Access), accessAssignment.Access.Title, user, "Assignment Updated", accessAssignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = equipment.Assignment.GetDescription(nameof(equipment), equipment.Title, user, "Assignment Updated", equipment.Assignment.Person.Name),
                ActorId = user.Id,
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
            var user = await _securityService.GetUser();
            var historyEntry = new History
            {
                Description = workstation.Assignment.GetDescription(nameof(workstation), workstation.Title, user, "Assignment Updated", workstation.Assignment.Person.Name),
                ActorId = user.Id,
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

