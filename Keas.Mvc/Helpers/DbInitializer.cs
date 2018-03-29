using System;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;

namespace Keas.Mvc.Helpers
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted(); // TODO: remove
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialized

            // add in some default facilities
            var room1 = new Room { BldgKey = "01", FloorKey = "01", RoomKey = "01", RoomName = "Bar", RoomNumber = "12" };
            var space1 = new Space { Room = room1, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space1);

            var scott = new User { Id = "123124", FirstName = "Scott", Name = "Scott Kirkland", Email = "scott@email.com" };
            var jason = new User { Id = "123222", Name = "Jason", Email = "jason@email.com" };
            var caes = new Team { Id = 1, Name = "CAESDO" };

            context.Users.Add(scott);
            context.Teams.Add(caes);

            var keymaster = new Role { Id= 1, Name = "KeyMaster"};
            context.TeamRoles.Add(keymaster);

            

            

            // add assets
            var jasonCaes = new Person { User = jason, Id=1, Team = caes, Group = "CRU" };
            var scottCaes = new Person { User = scott, Id=2, Team = caes, Group = "CRU" };

            var access = new AccessAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                Access = new Access { Team = caes, Name = "PPS" },
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var access2 = new AccessAssignment
            {
                Person = scottCaes,
                RequestedBy = scott,
                Access = new Access { Team = caes, Name = "PPS2" },
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var keyAssignment = new KeyAssignment
            {
                Person = jasonCaes,
                PersonId = jasonCaes.Id,
                RequestedBy = jason,
                ExpiresAt = DateTime.UtcNow.AddYears(5)
            };

            var key = new Key { SerialNumber = "SN", Team = caes, Name = "38 Mrak Keycard", Assignment = keyAssignment };

            var equipmentAssignment = new EquipmentAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equipment = new Equipment { Name = "laptop", Team = caes, Assignment = equipmentAssignment, SerialNumber = "XYZ" };

            context.AccessAssignments.Add(access);
            context.AccessAssignments.Add(access2);
            context.Keys.Add(key);
            context.KeyAssignments.Add(keyAssignment);
            context.EquipmentAssignments.Add(equipmentAssignment);
            context.Equipment.Add(equipment);

            var equip2Assignment = new EquipmentAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equip2 = new Equipment { Name = "desktop", Team = caes, Assignment = equip2Assignment, SerialNumber = "ABC" };

            context.EquipmentAssignments.Add(equip2Assignment);
            context.Equipment.Add(equip2);
            
            var history = new History {
                Person = jasonCaes,
                Actor = scott,
                Description = "Something important happened",
                Key = key
            };

            var scottKey = new TeamPermission{ Id = 1, Team = caes, TeamRole = keymaster, Person = scottCaes };
            context.TeamPermissions.Add(scottKey);

            context.Histories.Add(history);

            context.SaveChanges();
        }
    }
}