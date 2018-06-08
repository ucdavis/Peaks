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
            var space1 = new Space { BldgKey = "01", FloorKey = "01", RoomKey = "01", BldgName = "Foo", RoomName = "Bar", RoomNumber = "12", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space1);
            
            var space2 = new Space { BldgKey = "02", FloorKey = "03", RoomKey = "02", BldgName = "North Hall", RoomName = "Group/Meeting Room", RoomNumber = "308", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space2);

            var space3 = new Space { BldgKey = "02", FloorKey = "03", RoomKey = "03", BldgName = "North Hall", RoomName = "Meeting Room for CAPS Staff and Large Groups", RoomNumber = "325", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space3);

            var space4 = new Space { BldgKey = "02", FloorKey = "02", RoomKey = "04", BldgName = "North Hall", RoomNumber = "0206A", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space4);

            var space5 = new Space { BldgKey = "02", FloorKey = "01", RoomKey = "05", BldgName = "North Hall", RoomName = "Storage", RoomNumber = "0121A", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space5);

            var space6 = new Space { BldgKey = "03", FloorKey = "01", RoomKey = "06", BldgName = "South Hall", RoomName = "Storage", RoomNumber = "0121A", ChartNum = "3", OrgId = "ADNO" };
            context.Spaces.Add(space6);

            var scott = new User { Id = "postit", FirstName = "Scott", Name = "Scott Kirkland", Email = "srkirkland@ucdavis.edu" };
            var james = new User { Id = "jscub", FirstName = "James", Name = "James Cubbage", Email = "jscubbage@ucdavis.edu" };
            var laura = new User { Id = "holstege", Name = "Laura Holstege", Email = "laholstege@ucdavis.edu" };
            var caes = new Team { Id = 1, Name = "CAESDO" };

            context.Users.Add(scott);
            context.Users.Add(james);
            context.Teams.Add(caes);


            // Roles
            var keyMaster = new Role { Id= 1, Name = "KeyMaster"};
            var equipMaster = new Role {Id = 2, Name = "EquipMaster"};
            var departmentAdmin = new Role {Id= 3, Name = "DepartmentalAdmin"};
            var accessMaster = new Role {Id = 4, Name = "AccessMaster"};
            var spaceMaster = new Role {Id = 6, Name = "SpaceMaster"};
            var admin = new Role {Id = 5, Name = "Admin", IsAdmin = true};
            //var emulate = new Role {Id = 6, Name = "EmulationUser", IsAdmin = true};

            context.Roles.Add(keyMaster);
            context.Roles.Add(equipMaster);
            context.Roles.Add(departmentAdmin);
            context.Roles.Add(accessMaster);
            context.Roles.Add(spaceMaster);
            context.Roles.Add(admin);
            //context.Roles.Add(emulate);

            // add assets
            var lauraCaes = new Person { User = laura, Id=1, Team = caes, Group = "CRU", Tags = "CRU"};
            var scottCaes = new Person { User = scott, Id=2, Team = caes, Group = "CRU", Tags = "CRU" };
            var jamesCaes = new Person {User = james, Id = 3, Team = caes, Group = "CRU", Tags = "CRU" };

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

            var key = new Key { SerialNumber = "SN", Team = caes, Name = "38 Mrak Keycard", Assignment = keyAssignment, Space = space2 };

            var key2 = new Key { SerialNumber = "SN2", Team = caes, Name = "North Hall Keycard", Space = space3 };
            var workstationAssignment = new WorkstationAssignment{ Person = jamesCaes, PersonId = jamesCaes.Id, RequestedBy = laura, ExpiresAt = DateTime.UtcNow.AddYears(3)};
            var workstation = new Workstation{Name = "Corner desk", Team = caes, Type = "Desk", Space = space2, Assignment = workstationAssignment, Tags = "CRU"};
            context.Workstations.Add(workstation);

            var equipmentAssignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equipment = new Equipment { Name = "laptop", Team = caes, Assignment = equipmentAssignment, SerialNumber = "XYZ", Space = space3, Tags = "CRU,Computer" };

            context.Access.Add(access);
            context.AccessAssignments.Add(accessAssignment);
            context.Access.Add(access2);
            context.AccessAssignments.Add(accessAssignment2);

            context.Keys.Add(key);
            context.KeyAssignments.Add(keyAssignment);
            context.Keys.Add(key2);
            context.EquipmentAssignments.Add(equipmentAssignment);
            context.Equipment.Add(equipment);

            var equip2Assignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equip2 = new Equipment { Name = "desktop", Team = caes, Assignment = equip2Assignment, SerialNumber = "ABC", Space = space4, Tags = "CRU,Cellphone" };

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

            var workstationAssignment1 = new WorkstationAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var workstation1 = new Workstation { 
                Name = "Laura's Workstation", 
                Team = caes, 
                Assignment = workstationAssignment1, 
                Space = space3 };

            context.WorkstationAssignments.Add(workstationAssignment1);
            context.Workstations.Add(workstation1);

            var workstationAssignment2 = new WorkstationAssignment
            {
                Person = scottCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var workstation2 = new Workstation { 
                Name = "Scott's Workstation", 
                Team = caes, 
                Assignment = workstationAssignment2, 
                Space = space3 };

            context.WorkstationAssignments.Add(workstationAssignment2);
            context.Workstations.Add(workstation2);

            var workstation3 = new Workstation { 
                Name = "Empty Workstation", 
                Team = caes, 
                Space = space3 };
            context.Workstations.Add(workstation3);

            
            var scottKey = new TeamPermission{ Id = 1, Team = caes, Role = keyMaster, User = scott};
            var scottEquip = new TeamPermission {Id = 2, Team = caes, Role = equipMaster, User = scott};
            var scottAccess = new TeamPermission {Id = 3, Team = caes, Role = accessMaster, User = scott};
            var lauraKey = new TeamPermission{ Id = 4, Team = caes, Role = keyMaster, User = laura};
            var lauraEquip = new TeamPermission {Id = 5, Team = caes, Role = equipMaster, User = laura};
            var lauraAccess = new TeamPermission {Id = 6, Team = caes, Role = accessMaster, User = laura};
            var lauraSpace = new TeamPermission {Id = 7, Team = caes, Role = spaceMaster, User = laura};
            var jamesDa = new TeamPermission{Id = 8, Team = caes, Role = departmentAdmin, User = james};
            context.TeamPermissions.Add(scottKey);
            context.TeamPermissions.Add(scottEquip);

            context.TeamPermissions.Add(lauraEquip);
            context.TeamPermissions.Add(lauraKey);
            context.TeamPermissions.Add(lauraAccess);
            context.TeamPermissions.Add(lauraSpace);

            context.TeamPermissions.Add(jamesDa);
            context.TeamPermissions.Add(scottAccess);

            var jamesAdmin = new SystemPermission {Id = 1, Role = admin, User = james};
            context.SystemPermissions.Add(jamesAdmin);

            var CruTag = new Tag { Name = "CRU", Team = caes };
            var ASITag = new Tag { Name = "ASI", Team = caes };
            var CABATag = new Tag { Name = "CABA", Team = caes };
            var computerTag = new Tag { Name = "Computer", Team = caes };
            var cellPhoneTag = new Tag { Name = "Cellphone", Team = caes };
            context.Tags.Add(CruTag);
            context.Tags.Add(ASITag);
            context.Tags.Add(CABATag);
            context.Tags.Add(computerTag);
            context.Tags.Add(cellPhoneTag);

            context.Histories.Add(history);
            context.Histories.Add(history2);

            context.SaveChanges();
        }
    }
}