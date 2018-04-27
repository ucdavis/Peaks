using Keas.Core.Data;
using Keas.Core.Domain;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface IHistoryService
    {
        Task<History> KeyCreated(Key key, User user);
        Task<History> AccessCreated(Access access, User user);
        Task<History> EquipmentCreated(Equipment equipment, User user);
        Task<History> KeyUpdated(Key key, User user);
        Task<History> AccessUpdated(Access access, User user);
        Task<History> EquipmentUpdated(Equipment equipment, User user);
        Task<History> KeyInactivated(Key key, User user);
        Task<History> AccessInactivated(Access access, User user);
        Task<History> EquipmentInactivated(Equipment equipment, User user);
        Task<History> KeyAssigned(Key key, User user);
        Task<History> AccessAssigned(Access access, User user);
        Task<History> EquipmentAssigned(Equipment equipment, User user);
        Task<History> KeyUnassigned(Key key, User user);
        Task<History> AccessUnassigned(Access access, User user);
        Task<History> EquipmentUnassigned(Equipment equipment, User user);
        Task<History> KeyAccepted(Key key, User user);
        Task<History> AccessAccepted(Access access, User user);
        Task<History> EquipmentAccepted(Equipment equipment, User user);

    }

    public class HistoryService : IHistoryService
    {
        private readonly ApplicationDbContext _context;
        public HistoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<History> KeyCreated(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Created",
                Actor = user,
                AssetType = "Key",
                ActionType = "Created",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessCreated(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Created",
                Actor = user,
                AssetType = "Access",
                ActionType = "Created",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentCreated(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Created",
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Created",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyUpdated(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Updated",
                Actor = user,
                AssetType = "Key",
                ActionType = "Updated",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUpdated(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Updated",
                Actor = user,
                AssetType = "Access",
                ActionType = "Updated",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentUpdated(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Updated",
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Updated",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        public async Task<History> KeyInactivated(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Inactivated",
                Actor = user,
                AssetType = "Key",
                ActionType = "Inactivated",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessInactivated(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Inactivated",
                Actor = user,
                AssetType = "Access",
                ActionType = "Inactivated",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentInactivated(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Inactivated",
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Inactivated",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyAssigned(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Assigned to " + key.Assignment.Person.User.Name,
                Actor = user,
                AssetType = "Key",
                ActionType = "Assigned",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAssigned(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Assigned to ",
                Actor = user,
                AssetType = "Access",
                ActionType = "Assigned",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentAssigned(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Assigned to " + equipment.Assignment.Person.User.Name,
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Assigned",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyUnassigned(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Unassigned",
                Actor = user,
                AssetType = "Key",
                ActionType = "Unassigned",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessUnassigned(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Unassigned",
                Actor = user,
                AssetType = "Access",
                ActionType = "Unassigned",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentUnassigned(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Unassigned",
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Unassigned",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> KeyAccepted(Key key, User user)
        {
            var historyEntry = new History
            {
                Description = "Key Accepted",
                Actor = user,
                AssetType = "Key",
                ActionType = "Accepted",
                Key = key
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> AccessAccepted(Access access, User user)
        {
            var historyEntry = new History
            {
                Description = "Access Accepted",
                Actor = user,
                AssetType = "Access",
                ActionType = "Accepted",
                Access = access
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

        public async Task<History> EquipmentAccepted(Equipment equipment, User user)
        {
            var historyEntry = new History
            {
                Description = "Equipment Accepted",
                Actor = user,
                AssetType = "Equipment",
                ActionType = "Accepted",
                Equipment = equipment
            };
            _context.Histories.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }

    }
}

