﻿using System;
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

            if (context.Users.Any()) return; // already initialzied

            var scott = new User { Id = "123124", FirstName = "Scott", Name = "Scott Kirkland", Email = "scott@email.com" };
            var jason = new User { Id = "123222", Name = "Jason", Email = "jsylvestre@email.com" };
            var caes = new Team { Id = 1, Name = "CAESDO" };

            context.Users.Add(scott);
            context.Teams.Add(caes);
            context.TeamMemberships.Add(new TeamMembership { User = scott, Team = caes, Role = "Admin" });

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

            var key = new KeyAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                Key = new Key { SerialNumber = "SN", Team = caes, Name = "38 Mrak Keycard" },
                ExpiresAt = DateTime.UtcNow.AddYears(5)
            };

            var equipment = new EquipmentAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                Equipment = new Equipment { Name = "laptop", Team = caes },
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            context.AccessAssignments.Add(access);
            context.AccessAssignments.Add(access2);
            context.KeyAssignments.Add(key);
            context.EquipmentAssignments.Add(equipment);

            var equip2 = new EquipmentAssignment
            {
                Person = jasonCaes,
                RequestedBy = scott,
                Equipment = new Equipment { Name = "desktop", Team = caes },
                ExpiresAt = DateTime.UtcNow.AddYears(3)
            };

            equip2.Equipment.AddAttribute("OS", "windows");

            context.EquipmentAssignments.Add(equip2);
            
            var history = new History {
                Person = jasonCaes,
                Actor = scott,
                Description = "Something important happened",
                Key = key.Key
            };

            context.Histories.Add(history);

            context.SaveChanges();
        }
    }
}