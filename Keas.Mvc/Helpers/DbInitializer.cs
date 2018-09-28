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

            var scott = new User { Id = "postit", FirstName = "Scott", LastName = "Kirkland", Email = "srkirkland@ucdavis.edu" };
            var james = new User { Id = "jscub", FirstName = "James", LastName = "Cubbage", Email = "jscubbage@ucdavis.edu" };
            var laura = new User { Id = "holstege", FirstName = "Laura", LastName = "Holstege", Email = "laholstege@ucdavis.edu" };
            var cal = new User { Id = "cydoval", FirstName = "Cal", LastName = "Doval", Email = "cydoval@ucdavis.edu" };
            var jason = new User { Id = "jsylvest", FirstName = "Jason", LastName = "Sylvestre", Email = "jsylvestre@ucdavis.edu" };

            var caes = new Team {  Name = "CAESDO", Slug = "CAESDO" };

            context.Users.Add(scott);
            context.Users.Add(james);
            context.Users.Add(laura);
            context.Users.Add(cal);
            context.Users.Add(jason);
            context.Teams.Add(caes);


            // Roles
            var keyMaster = new Role {  Name = "KeyMaster"};
            var equipMaster = new Role {Name = "EquipMaster"};
            var departmentAdmin = new Role {Name = "DepartmentalAdmin"};
            var accessMaster = new Role { Name = "AccessMaster"};
            var spaceMaster = new Role { Name = "SpaceMaster"};
            var admin = new Role { Name = "Admin", IsAdmin = true};
            //var emulate = new Role {Id = 6, Name = "EmulationUser", IsAdmin = true};

            context.Roles.Add(keyMaster);
            context.Roles.Add(equipMaster);
            context.Roles.Add(departmentAdmin);
            context.Roles.Add(accessMaster);
            context.Roles.Add(spaceMaster);
            context.Roles.Add(admin);
            //context.Roles.Add(emulate);

            // add assets
            var lauraCaes = new Person { User = laura, Team = caes, Group = "CRU", Tags = "CRU,Student", 
                FirstName = laura.FirstName, LastName = laura.LastName, Email = laura.Email};
            var scottCaes = new Person { User = scott, Team = caes, Group = "CRU", Tags = "CRU",
                FirstName = scott.FirstName, LastName = scott.LastName, Email = scott.Email};
            var jamesCaes = new Person {User = james,  Team = caes, Group = "CRU", Tags = "CRU",
                FirstName = james.FirstName, LastName = james.LastName, Email = james.Email};
            var calCaes = new Person {User = cal,  Team = caes, Group = "CRU", Tags = "CRU", 
                FirstName = cal.FirstName, LastName = cal.LastName, Email = cal.Email};
            var jasonCaes = new Person {User = jason,  Team = caes, Group = "CRU", Tags = "CRU", 
                FirstName = jason.FirstName, LastName = jason.LastName, Email = jason.Email};

            context.People.Add(jamesCaes);
            context.People.Add(lauraCaes);
            context.People.Add(scottCaes);
            context.People.Add(calCaes);
            context.People.Add(jasonCaes);

            var access = new Access
            {
                Name = "PPS", Team = caes
            };
            var accessAssignment = new AccessAssignment
            {
                //Access = access,
                Person = lauraCaes,
                PersonId = lauraCaes.Id,
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
                PersonId = scottCaes.Id,
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

            var keyAssignment2 = new KeyAssignment { Person = jamesCaes, PersonId = jamesCaes.Id, RequestedBy = laura, ExpiresAt = DateTime.UtcNow.AddYears(5)};

            var key = new Key { Number = "A1", Team = caes, Name = "38 Mrak Keycard", Active = false};
            var key1Space = new KeyXSpace {Key = key, Space = space2};
            var key1Serial = new Serial {Key = key, Number = "1", Assignment = keyAssignment};

            var key2 = new Key { Number = "A2", Team = caes, Name = "North Hall Keycard" };
            var key2Space = new KeyXSpace { Key = key, Space = space3 };
            var key2Serial = new Serial { Key = key, Number = "SN1" };
            var key2Serial2 = new Serial {Key = key2, Number = "2", Assignment = keyAssignment2};
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
            context.KeyXSpaces.Add(key1Space);
            context.Serials.Add(key1Serial);
            context.KeyAssignments.Add(keyAssignment);
            context.Keys.Add(key2);
            context.KeyXSpaces.Add(key2Space);
            context.Serials.Add(key2Serial);
            context.Serials.Add(key2Serial2);
            context.KeyAssignments.Add(keyAssignment2);
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
                Tags = "Student,Standing Desk",
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
                Tags = "Standing Desk",
                Space = space4 };

            context.WorkstationAssignments.Add(workstationAssignment2);
            context.Workstations.Add(workstation2);

            var workstation3 = new Workstation {
                Name = "Empty Workstation",
                Team = caes,
                Space = space3 };
            context.Workstations.Add(workstation3);

            var tag1 = new Tag {
                Name = "Student",
                Team = caes
            };

            var tag2 = new Tag {
                Name = "Standing Desk",
                Team = caes
            };

            context.Tags.Add(tag1);
            context.Add(tag2);


            var scottKey = new TeamPermission    {Team = caes, Role = keyMaster, User = scott};
            var scottEquip = new TeamPermission  {Team = caes, Role = equipMaster, User = scott};
            var scottDa = new TeamPermission {Team = caes, Role = departmentAdmin, User = scott};
            var lauraDa = new TeamPermission    {Team = caes, Role = departmentAdmin, User = laura};
            var jamesDa = new TeamPermission     {Team = caes, Role = departmentAdmin, User = james};
            var calDa = new TeamPermission     {Team = caes, Role = departmentAdmin, User = cal};
            var jasonKey = new TeamPermission    {Team = caes, Role = keyMaster, User = jason};
            var jasonDa = new TeamPermission     {Team = caes, Role = departmentAdmin, User = jason};

            context.TeamPermissions.Add(scottKey);
            context.TeamPermissions.Add(scottEquip);
            context.TeamPermissions.Add(jasonKey);

            context.TeamPermissions.Add(lauraDa);
            context.TeamPermissions.Add(jasonDa);
            context.TeamPermissions.Add(jamesDa);
            context.TeamPermissions.Add(scottDa);
            context.TeamPermissions.Add(calDa);

            var jamesAdmin = new SystemPermission { Role = admin, User = james};
            context.SystemPermissions.Add(jamesAdmin);

            var lauraAdmin = new SystemPermission { Role = admin, User = laura};
            context.SystemPermissions.Add(lauraAdmin);

            var scottAdmin = new SystemPermission { Role = admin, User = scott};
            context.SystemPermissions.Add(scottAdmin);

            var calAdmin = new SystemPermission { Role = admin, User = cal};
            context.SystemPermissions.Add(calAdmin);

            var jasonAdmin = new SystemPermission { Role = admin, User = jason};
            context.SystemPermissions.Add(jasonAdmin);

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


            var notification1 = new Notification {DateTimeCreated = DateTime.UtcNow, Details = history.Description, History = history, HistoryId = history.Id, Pending = true, User = scott };
            var notification2 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history2.Description, History = history2, HistoryId = history2.Id, Pending = true, User = scott };

            var notification3 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history.Description, History = history, HistoryId = history.Id, Pending = true, User = james };
            var notification4 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history2.Description, History = history2, HistoryId = history2.Id, Pending = true, User = james };

            context.Notifications.Add(notification1);
            context.Notifications.Add(notification2);
            context.Notifications.Add(notification3);
            context.Notifications.Add(notification4);

            context.SaveChanges();
        }
    }
}
