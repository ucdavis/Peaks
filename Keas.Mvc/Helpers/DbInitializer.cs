using System;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Collections.Generic;

namespace Keas.Mvc.Helpers
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted(); // TODO: remove
            context.Database.EnsureCreated();

            if (context.Users.Any()) return; // already initialized

            // add in some default factilities
            var room1 = new Room { BldgKey = "01", FloorKey = "01", RoomKey = "01", BldgName="Foo", RoomName = "Bar", RoomNumber = "12" };
            var space1 = new Space { Room = room1, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space1);

            var room2 = new Room { BldgKey = "02", FloorKey = "03", RoomKey = "02", BldgName = "North Hall", RoomName = "Group/Meeting Room", RoomNumber = "308" };
            var space2 = new Space { Room = room2, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space2);

            var room3 = new Room { BldgKey = "02", FloorKey = "03", RoomKey = "03", BldgName = "North Hall", RoomName = "Meeting Room for CAPS Staff and Large Groups", RoomNumber = "325" };
            var space3 = new Space { Room = room3, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space3);

            var room4 = new Room { BldgKey = "02", FloorKey = "02", RoomKey = "04", BldgName = "North Hall", RoomNumber = "0206A" };
            var space4 = new Space { Room = room4, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space4);

            var room5 = new Room { BldgKey = "02", FloorKey = "01", RoomKey = "05", BldgName = "North Hall", RoomName = "Storage", RoomNumber = "0121A" };
            var space5 = new Space { Room = room5, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space5);

            var room6 = new Room { BldgKey = "03", FloorKey = "01", RoomKey = "06", BldgName = "South Hall", RoomName = "Storage", RoomNumber = "0121A" };
            var space6 = new Space { Room = room6, ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space6);

            var scott = new User { Id = "123124", FirstName = "Scott", Name = "Scott Kirkland", Email = "scott@email.com" };
            var james = new User { Id = "141414", FirstName = "James", Name = "James Cubbage", Email = "jscubbage@ucdavis.edu" };
            var laura = new User { Id = "123222", Name = "Laura Holstege", Email = "laholstege@ucdavis.edu" };
            var caes = new Team { Id = 1, Name = "CAESDO" };

            context.Users.Add(scott);
            context.Users.Add(james);
            context.Teams.Add(caes);


            // Roles
            var keyMaster = new Role { Id= 1, Name = "KeyMaster"};
            var equipMaster = new Role {Id = 2, Name = "EquipMaster"};
            var departmentAdmin = new Role {Id= 3, Name = "DepartmentalAdmin"};
            var accessMaster = new Role {Id = 4, Name = "AccessMaster"};
            var admin = new Role {Id = 5, Name = "Admin", IsAdmin = true};
            //var emulate = new Role {Id = 6, Name = "EmulationUser", IsAdmin = true};

            context.Roles.Add(keyMaster);
            context.Roles.Add(equipMaster);
            context.Roles.Add(departmentAdmin);
            context.Roles.Add(accessMaster);
            context.Roles.Add(admin);
            //context.Roles.Add(emulate);

            // add assets
            var lauraCaes = new Person { User = laura, Id=1, Team = caes, Group = "CRU" };
            var scottCaes = new Person { User = scott, Id=2, Team = caes, Group = "CRU" };
            var jamesCaes = new Person {User = james, Id = 3, Team = caes, Group = "CRU"};

            context.People.Add(jamesCaes);

            var access = new Access
            {
                Name = "PPS", Team = caes
            };
            var accessAssignment = new AccessAssignment
            {
                //Access = access,
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };
            access.Assignments.Add(accessAssignment);
            lauraCaes.AccessAssignments.Add(accessAssignment);

            var access2 = new Access
            {
                Name = "PPS2",
                Team = caes,
            };

            var accessAssignment2 = new AccessAssignment
            {
                //Access = access2,
                Person = scottCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };
            access2.Assignments.Add(accessAssignment2);
            scottCaes.AccessAssignments.Add(accessAssignment2);

            var keyAssignment = new KeyAssignment
            {
                Person = lauraCaes,
                PersonId = lauraCaes.Id,
                RequestedBy = laura,
                ExpiresAt = DateTime.UtcNow.AddYears(5)
            };

            var key = new Key { SerialNumber = "SN", Team = caes, Name = "38 Mrak Keycard", Assignment = keyAssignment, Room = room2 };

            var equipmentAssignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equipment = new Equipment { Name = "laptop", Team = caes, Assignment = equipmentAssignment, SerialNumber = "XYZ", Room = room3 };

            context.Access.Add(access);
            context.AccessAssignments.Add(accessAssignment);
            context.Access.Add(access2);
            context.AccessAssignments.Add(accessAssignment2);

            context.Keys.Add(key);
            context.KeyAssignments.Add(keyAssignment);
            context.EquipmentAssignments.Add(equipmentAssignment);
            context.Equipment.Add(equipment);

            var equip2Assignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equip2 = new Equipment { Name = "desktop", Team = caes, Assignment = equip2Assignment, SerialNumber = "ABC", Room = room4 };

            context.EquipmentAssignments.Add(equip2Assignment);
            context.Equipment.Add(equip2);
            
            var history = new History {
                Target = lauraCaes,
                Actor = scott,
                Description = "Something important happened",
                AssetType = "Key",
                Key = key
            };

            var history2 = new History {
                Target = lauraCaes,
                Actor = scott,
                Description = "Something important happened 2",
                AssetType = "Equipment",
                Equipment = equipment
            };

            var scottKey = new TeamPermission{ Id = 1, Team = caes, Role = keyMaster, User = scott};
            var scottEquip = new TeamPermission {Id = 2, Team = caes, Role = equipMaster, User = scott};
            var scottAccess = new TeamPermission {Id = 3, Team = caes, Role = accessMaster, User = scott};
            var lauraKey = new TeamPermission{ Id = 4, Team = caes, Role = keyMaster, User = laura};
            var lauraEquip = new TeamPermission {Id = 5, Team = caes, Role = equipMaster, User = laura};
            var lauraAccess = new TeamPermission {Id = 6, Team = caes, Role = accessMaster, User = laura};
            var jamesDa = new TeamPermission{Id = 7, Team = caes, Role = departmentAdmin, User = james};
            context.TeamPermissions.Add(scottKey);
            context.TeamPermissions.Add(scottEquip);

            context.TeamPermissions.Add(lauraEquip);
            context.TeamPermissions.Add(lauraKey);
            context.TeamPermissions.Add(lauraAccess);

            context.TeamPermissions.Add(jamesDa);
            context.TeamPermissions.Add(scottAccess);

            var JamesAdmin = new SystemPermission {Id = 1, Role = admin, User = james};
            context.SystemPermissions.Add(JamesAdmin);

            context.Histories.Add(history);
            context.Histories.Add(history2);

            context.SaveChanges();
        }
    }
}