using Keas.Core.Domain;
using System.Threading.Tasks;

namespace Keas.Mvc.Services
{
    public interface IEventService
    {
        Task TrackCreateKey(Key key);
        Task TrackAssignKey(Key key);
        Task TrackUnAssignKey(Key key);
        Task TrackUpdateKey(Key key);
        Task TrackCreateEquipment(Equipment equipment);
        Task TrackAssignEquipment(Equipment equipment);
        Task TrackUnAssignEquipment(Equipment equipment);
        Task TrackUpdateEquipment(Equipment equipment);
        Task TrackCreateAccess(Access access);
        Task TrackAssignAccess(AccessAssignment accessAssignment, string teamName);
        Task TrackUnAssignAccess(AccessAssignment accessAssignment, string teamName);
        Task TrackUpdateAccess(Access access);
        Task TrackCreateWorkstation(Workstation workstation);
        Task TrackAssignWorkstation(Workstation workstation);
        Task TrackUnAssignWorkstation(Workstation workstation);
        Task TrackAcceptKey(Key key);
        Task TrackAcceptEquipment(Equipment equipment);
        


    }
    public class EventService : IEventService
    {
        private readonly IHistoryService _historyService;
        private readonly INotificationService _notificationService;

        public EventService(IHistoryService historyService, INotificationService notificationService)
        {
            _historyService = historyService;
            _notificationService = notificationService;
        }

        public async Task TrackCreateKey(Key key)
        {
            var history = await _historyService.KeyCreated(key);
            await _notificationService.KeyCreatedUpdatedInactive(key, history);
        }

        public async Task TrackAssignKey(Key key)
        {
            var history = await _historyService.KeyAssigned(key);
            await _notificationService.KeyAssigned(key, history);

        }

        public async Task TrackUnAssignKey(Key key)
        {
            var history = await _historyService.KeyUnassigned(key);
            await _notificationService.KeyUnAssigned(key, history);
        }

        public async Task TrackUpdateKey(Key key) 
        {
            var history = await _historyService.KeyUpdated(key);
            await _notificationService.KeyCreatedUpdatedInactive(key, history);
        }

        public async Task TrackCreateEquipment(Equipment equipment)
        {
            var history = await _historyService.EquipmentCreated(equipment);
            await _notificationService.EquipmentCreatedUpdatedInactive(equipment, history);
        }

        public async Task TrackAssignEquipment(Equipment equipment)
        {
            var history = await _historyService.EquipmentAssigned(equipment);
            await _notificationService.EquipmentAssigned(equipment, history);
        }

        public async Task TrackUnAssignEquipment(Equipment equipment)
        {
            var history = await _historyService.EquipmentUnassigned(equipment);
            await _notificationService.EquipmentUnAssigned(equipment, history);
        }
        public async Task TrackUpdateEquipment(Equipment equipment) 
        {
            var history = await _historyService.EquipmentUpdated(equipment);
            await _notificationService.EquipmentCreatedUpdatedInactive(equipment, history);
        }


        public async Task TrackCreateAccess(Access access)
        {
            var history = await _historyService.AccessCreated(access);
            await _notificationService.AccessCreatedUpdatedInactive(access, history);
        }

        public async Task TrackAssignAccess(AccessAssignment accessAssignment, string teamName)
        {
            var history = await _historyService.AccessAssigned(accessAssignment);
            await _notificationService.AccessAssigned(accessAssignment, history, teamName);

        }

        public async Task TrackUnAssignAccess(AccessAssignment accessAssignment, string teamName)
        {
            var history = await _historyService.AccessUnassigned(accessAssignment);
            await _notificationService.AccessUnAssigned(accessAssignment, history, teamName);
        }
        public async Task TrackUpdateAccess(Access access) 
        {
            var history = await _historyService.AccessUpdated(access);
            await _notificationService.AccessCreatedUpdatedInactive(access, history);
        }

        public async Task TrackCreateWorkstation(Workstation workstation)
        {
            var history = await _historyService.WorkstationCreated(workstation);
            await _notificationService.WorkstationCreatedUpdatedInactive(workstation, history);
        }

        public async Task TrackAssignWorkstation(Workstation workstation)
        {
            var history = await _historyService.WorkstationAssigned(workstation);
            await _notificationService.WorkstationAssigned(workstation, history);
        }

        public async Task TrackUnAssignWorkstation(Workstation workstation)
        {
            var history = await _historyService.WorkstationUnassigned(workstation);
            await _notificationService.WorkstationUnAssigned(workstation, history);
        }

        public async Task TrackAcceptKey(Key key)
        {
            var history = await _historyService.KeyAccepted(key);
            await _notificationService.KeyAccepted(key, history);
        }

        public async Task TrackAcceptEquipment(Equipment equipment)
        {
            var history = await _historyService.EquipmentAccepted(equipment);
            await _notificationService.EquipmentAccepted(equipment, history);
        }
    }
}

