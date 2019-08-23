using System;
using System.Linq;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Helpers
{
    public class DbInitializer
    {
        private readonly ApplicationDbContext _context;

        public DbInitializer(ApplicationDbContext context)
        {
            _context = context;
        }

        public void Initialize()
        {
            // Create All Roles
            var keyMaster       = CreateOrFindRole(new Role { Name = "KeyMaster" });
            var equipMaster     = CreateOrFindRole(new Role { Name = "EquipMaster" });
            var departmentAdmin = CreateOrFindRole(new Role { Name = "DepartmentalAdmin" });
            var accessMaster    = CreateOrFindRole(new Role { Name = "AccessMaster" });
            var spaceMaster     = CreateOrFindRole(new Role { Name = "SpaceMaster" });
            var admin           = CreateOrFindRole(new Role { Name = "Admin", IsAdmin = true });
            var personManager   = CreateOrFindRole(new Role { Name = "PersonManager"});

            // Create All Super Users
            var scott = CreateOrFindUser(new User { Id = "postit", FirstName = "Scott", LastName = "Kirkland", Email = "srkirkland@ucdavis.edu" });
            var james = CreateOrFindUser(new User { Id = "jscub", FirstName = "James", LastName = "Cubbage", Email = "jscubbage@ucdavis.edu" });
            var laura = CreateOrFindUser(new User { Id = "holstege", FirstName = "Laura", LastName = "Holstege", Email = "laholstege@ucdavis.edu" });
            var cal   = CreateOrFindUser(new User { Id = "cydoval", FirstName = "Cal", LastName = "Doval", Email = "cydoval@ucdavis.edu" });
            var jason = CreateOrFindUser(new User { Id = "jsylvest", FirstName = "Jason", LastName = "Sylvestre", Email = "jsylvestre@ucdavis.edu" });
            var nabil = CreateOrFindUser(new User { Id = "nfurmoli", FirstName = "Nabil", LastName = "Furmoli", Email = "anfurmoli@ucdavis.edu" });
            
            // Create All Admin Assignments
            CreateSystemPermission(new SystemPermission { Role = admin, User = james });
            CreateSystemPermission(new SystemPermission { Role = admin, User = laura });
            CreateSystemPermission(new SystemPermission { Role = admin, User = scott });
            CreateSystemPermission(new SystemPermission { Role = admin, User = cal });
            CreateSystemPermission(new SystemPermission { Role = admin, User = jason });
            CreateSystemPermission(new SystemPermission { Role = admin, User = nabil });

            CreateGlobalAttributeKey(new AttributeKey { Key = "Service Tag"                 , Description = "Service Tag"                             , TeamId = null});
            CreateGlobalAttributeKey(new AttributeKey { Key = "Hostname"                    , Description = "Hostname"                                , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "IP Address"                  , Description = "IP Address"                              , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "Mac Address"                 , Description = "Mac Address"                             , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "OS"                          , Description = "Operating System"                        , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "Owner"                       , Description = "The person responsible for the equipment", TeamId = null }); //Maybe we will add this as a field?
            CreateGlobalAttributeKey(new AttributeKey { Key = "Phone Number"                , Description = "Phone Number"                            , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "PrePurchasing Request Number", Description = "PrePurchasing Request Number"            , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "Warranty Expiration Date"    , Description = "Warranty Expiration Date"                , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "Purchase Date"               , Description = "Date was purchased"                      , TeamId = null });
            CreateGlobalAttributeKey(new AttributeKey { Key = "External Link"               , Description = "URL to more info"                        , TeamId = null });

            _context.SaveChanges();
        }

        private Role CreateOrFindRole(Role role)
        {
            var matchingRole = _context.Roles.FirstOrDefault(r => r.Name == role.Name);

            if (matchingRole != null)
            {
                return matchingRole;
            }

            _context.Roles.Add(role);
            return role;
        }

        private User CreateOrFindUser(User user)
        {
            var matchingUser = _context.Users.FirstOrDefault(u => u.Id == user.Id);

            if (matchingUser != null)
            {
                return matchingUser;
            }

            _context.Users.Add(user);
            return user;
        }

        private void CreateSystemPermission(SystemPermission permission)
        {
            var found = _context.SystemPermissions
                .FirstOrDefault(p => p.UserId == permission.User.Id && p.RoleId == permission.Role.Id);

            if (found != null)
            {
                return;
            }

            _context.SystemPermissions.Add(permission);
        }

        private void CreateGlobalAttributeKey(AttributeKey attributeKey)
        {
            if ( _context.AttributeKeys.Any(a =>
                a.Key.Equals(attributeKey.Key, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            _context.AttributeKeys.Add(attributeKey);
        }

        public void CreateSampleData()
        {
            // find users and roles
            var scott = _context.Users.Find("postit");
            var laura = _context.Users.Find("holstege");
            var james = _context.Users.Find("jscub");
            var cal   = _context.Users.Find("cydoval");
            var jason = _context.Users.Find("jsylvest");

            var departmentAdmin = _context.Roles.Single(r => r.Name == "DepartmentalAdmin");

            // teams
            var caes = new Team { Name = "CAESDO", Slug = "caesdo" };
            var ps = new Team { Name = "Plant Sciences", Slug = "plantsciences" };

            _context.Teams.Add(caes);
            _context.Teams.Add(ps);

            // team permissions
            _context.TeamPermissions.Add(new TeamPermission { Team = caes, Role = departmentAdmin, User = scott });
            _context.TeamPermissions.Add(new TeamPermission { Team = caes, Role = departmentAdmin, User = laura });
            _context.TeamPermissions.Add(new TeamPermission { Team = caes, Role = departmentAdmin, User = james });
            _context.TeamPermissions.Add(new TeamPermission { Team = caes, Role = departmentAdmin, User = cal });
            _context.TeamPermissions.Add(new TeamPermission { Team = caes, Role = departmentAdmin, User = jason });

            // people
            var lauraCaes = new Person
            {
                User = laura,
                Team = caes,
                Tags = "CRU,Student",
                FirstName = laura.FirstName,
                LastName = laura.LastName,
                Email = laura.Email
            };
            var scottCaes = new Person
            {
                User = scott,
                Team = caes,
                Tags = "CRU",
                FirstName = scott.FirstName,
                LastName = scott.LastName,
                Email = scott.Email
            };
            var jamesCaes = new Person
            {
                User = james,
                Team = caes,
                Tags = "CRU",
                FirstName = james.FirstName,
                LastName = james.LastName,
                Email = james.Email
            };
            var calCaes = new Person
            {
                User = cal,
                Team = caes,
                Tags = "CRU",
                FirstName = cal.FirstName,
                LastName = cal.LastName,
                Email = cal.Email
            };
            var jasonCaes = new Person
            {
                User = jason,
                Team = caes,
                Tags = "CRU",
                FirstName = jason.FirstName,
                LastName = jason.LastName,
                Email = jason.Email
            };

            var jamesPs = new Person
            {
                User = james,
                Team = ps,
                FirstName = james.FirstName,
                LastName = james.LastName,
                Email = james.Email
            };

            _context.People.Add(jamesCaes);
            _context.People.Add(lauraCaes);
            _context.People.Add(scottCaes);
            _context.People.Add(calCaes);
            _context.People.Add(jamesPs);
            _context.People.Add(jasonCaes);
            _context.People.Add(jamesPs);

            // tags
            var studentTag      = new Tag { Name = "Student", Team = caes };
            var standingDeskTag = new Tag { Name = "Standing Desk", Team = caes };
            var cruTag          = new Tag { Name = "CRU", Team = caes };
            var asiTag          = new Tag { Name = "ASI", Team = caes };
            var cabaTag         = new Tag { Name = "CABA", Team = caes };
            var computerTag     = new Tag { Name = "Computer", Team = caes };
            var cellPhoneTag    = new Tag { Name = "Cellphone", Team = caes };

            _context.Tags.Add(cruTag);
            _context.Tags.Add(studentTag);
            _context.Tags.Add(standingDeskTag);
            _context.Tags.Add(asiTag);
            _context.Tags.Add(cabaTag);
            _context.Tags.Add(computerTag);
            _context.Tags.Add(cellPhoneTag);

            // access
            var access = new Access
            {
                Name = "PPS",
                Team = caes,
            };
            var accessAssignment = new AccessAssignment
            {
                Person = lauraCaes,
                PersonId = lauraCaes.Id,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };
            access.Assignments.Add(accessAssignment);
            lauraCaes.AccessAssignments.Add(accessAssignment);

            _context.Access.Add(access);
            _context.AccessAssignments.Add(accessAssignment);

            var access2 = new Access
            {
                Name = "PPS2",
                Team = caes,
            };

            var accessAssignment2 = new AccessAssignment
            {
                Person = scottCaes,
                PersonId = scottCaes.Id,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };
            access2.Assignments.Add(accessAssignment2);
            scottCaes.AccessAssignments.Add(accessAssignment2);
            
            _context.Access.Add(access2);
            _context.AccessAssignments.Add(accessAssignment2);

            // organization
            var orgId = new FinancialOrganization { Chart = "3", OrgCode = "ADNO", Team = caes };
            _context.FISOrgs.Add(orgId);

            // spaces
            var space2 = new Space { BldgKey = "02", FloorKey = "03", RoomKey = "02", BldgName = "North Hall", RoomName = "Group/Meeting Room", RoomNumber = "308", ChartNum = "3", OrgId = "ADNO" };
            _context.Spaces.Add(space2);

            var space3 = new Space { BldgKey = "02", FloorKey = "03", RoomKey = "03", BldgName = "North Hall", RoomName = "Meeting Room for CAPS Staff and Large Groups", RoomNumber = "325", ChartNum = "3", OrgId = "ADNO" };
            _context.Spaces.Add(space3);

            var space4 = new Space { BldgKey = "02", FloorKey = "02", RoomKey = "04", BldgName = "North Hall", RoomNumber = "0206A", ChartNum = "3", OrgId = "ADNO" };
            _context.Spaces.Add(space4);

            var space5 = new Space { BldgKey = "02", FloorKey = "01", RoomKey = "05", BldgName = "North Hall", RoomName = "Storage", RoomNumber = "0121A", ChartNum = "3", OrgId = "ADNO" };
            _context.Spaces.Add(space5);

            var space6 = new Space { BldgKey = "03", FloorKey = "01", RoomKey = "06", BldgName = "South Hall", RoomName = "Storage", RoomNumber = "0121A", ChartNum = "3", OrgId = "ADNO" };
            _context.Spaces.Add(space6);

            // workstations
            var workstationAssignment = new WorkstationAssignment { Person = jamesCaes, PersonId = jamesCaes.Id, RequestedBy = laura, ExpiresAt = DateTime.UtcNow.AddYears(3) };
            var workstation = new Workstation { Name = "Corner desk", Team = caes, Type = "Desk", Space = space2, Assignment = workstationAssignment, Tags = "CRU" };
            _context.Workstations.Add(workstation);

            var workstationAssignment1 = new WorkstationAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var workstation1 = new Workstation
            {
                Name = "Laura's Workstation",
                Team = caes,
                Assignment = workstationAssignment1,
                Tags = "Student,Standing Desk",
                Space = space3
            };

            _context.WorkstationAssignments.Add(workstationAssignment1);
            _context.Workstations.Add(workstation1);

            var workstationAssignment2 = new WorkstationAssignment
            {
                Person = scottCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var workstation2 = new Workstation
            {
                Name = "Scott's Workstation",
                Team = caes,
                Assignment = workstationAssignment2,
                Tags = "Standing Desk",
                Space = space4
            };

            _context.WorkstationAssignments.Add(workstationAssignment2);
            _context.Workstations.Add(workstation2);

            var workstation3 = new Workstation
            {
                Name = "Empty Workstation",
                Team = caes,
                Space = space3
            };
            _context.Workstations.Add(workstation3);

            // equipment
            var equipmentAssignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equipment = new Equipment { Name = "laptop", Team = caes, Assignment = equipmentAssignment, SerialNumber = "XYZ", Space = space3, Tags = "CRU,Computer" };

            _context.EquipmentAssignments.Add(equipmentAssignment);
            _context.Equipment.Add(equipment);

            var equip2Assignment = new EquipmentAssignment
            {
                Person = lauraCaes,
                RequestedBy = scott,
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            var equip2 = new Equipment { Name = "desktop", Team = caes, Assignment = equip2Assignment, SerialNumber = "ABC", Space = space4, Tags = "CRU,Cellphone" };

            _context.EquipmentAssignments.Add(equip2Assignment);
            _context.Equipment.Add(equip2);

            // keys
            var key1 = new Key { Code = "A1", Team = caes, Name = "38 Mrak Keycard", Active = false };
            var key1Space = new KeyXSpace { Key = key1, Space = space2 };
            var key1Serial = new KeySerial
            {
                Key = key1,
                Number = "1",
                KeySerialAssignment = new KeySerialAssignment
                {
                    Person = lauraCaes,
                    PersonId = lauraCaes.Id,
                    RequestedBy = laura,
                    ExpiresAt = DateTime.UtcNow.AddYears(5)
                }
            };
            _context.Keys.Add(key1);
            _context.KeyXSpaces.Add(key1Space);
            _context.KeySerials.Add(key1Serial);

            var key2 = new Key { Code = "A2", Team = caes, Name = "North Hall Keycard" };
            var key2Space = new KeyXSpace { Key = key2, Space = space3 };
            var key2Serial = new KeySerial { Key = key2, Number = "SN1" };
            var key2Serial2 = new KeySerial
            {
                Key = key2,
                Number = "2",
                KeySerialAssignment = new KeySerialAssignment
                {
                    Person = jamesCaes,
                    PersonId = jamesCaes.Id,
                    RequestedBy = laura,
                    ExpiresAt = DateTime.UtcNow.AddYears(5)
                }
            };
            _context.Keys.Add(key2);
            _context.KeyXSpaces.Add(key2Space);
            _context.KeySerials.Add(key2Serial);
            _context.KeySerials.Add(key2Serial2);

            // history
            var history = new History
            {
                Target = lauraCaes,
                Actor = scott,
                Description = "Something important happened",
                AssetType = "Key",
                Key = key1
            };

            var history2 = new History
            {
                Target = lauraCaes,
                Actor = scott,
                Description = "Something important happened 2",
                AssetType = "Equipment",
                Equipment = equipment
            };

            _context.Histories.Add(history);
            _context.Histories.Add(history2);

            // notifications
            var notification1 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history.Description, History = history, HistoryId = history.Id, Pending = true, User = scott };
            var notification2 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history2.Description, History = history2, HistoryId = history2.Id, Pending = true, User = scott };
            var notification3 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history.Description, History = history, HistoryId = history.Id, Pending = true, User = james };
            var notification4 = new Notification { DateTimeCreated = DateTime.UtcNow, Details = history2.Description, History = history2, HistoryId = history2.Id, Pending = true, User = james };

            _context.Notifications.Add(notification1);
            _context.Notifications.Add(notification2);
            _context.Notifications.Add(notification3);
            _context.Notifications.Add(notification4);

            _context.SaveChanges();
        }
    }
}
