using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Data;
using Keas.Core.Domain;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsDatabase
{
    [Trait("Category","DatabaseTableTests")]
    public class ApplicationDbContextTests
    {
        #region Reflection of Database

        /// <summary>
        /// If this fails, don't forget to add tests for the new table
        /// </summary>
        [Fact]
        public void TestDatabaseFieldAttributes()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("Access", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Access]", new List<string>()));
            expectedFields.Add(new NameAndType("AccessAssignments", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.AccessAssignment]", new List<string>()));            
            expectedFields.Add(new NameAndType("ChangeTracker", "Microsoft.EntityFrameworkCore.ChangeTracking.ChangeTracker", new List<string>()));
            expectedFields.Add(new NameAndType("Database", "Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade", new List<string>()));
            expectedFields.Add(new NameAndType("Equipment", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Equipment]", new List<string>()));
            expectedFields.Add(new NameAndType("EquipmentAssignments", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.EquipmentAssignment]", new List<string>()));
            expectedFields.Add(new NameAndType("EquipmentAttributes", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.EquipmentAttribute]", new List<string>()));
            expectedFields.Add(new NameAndType("FISOrgs", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.FinancialOrganization]", new List<string>()));
            expectedFields.Add(new NameAndType("Histories", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.History]", new List<string>()));
            expectedFields.Add(new NameAndType("Keys", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Key]", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerialAssignments", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.KeySerialAssignment]", new List<string>()));
            expectedFields.Add(new NameAndType("KeySerials", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.KeySerial]", new List<string>()));
            expectedFields.Add(new NameAndType("KeyXSpaces", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.KeyXSpace]", new List<string>()));
            expectedFields.Add(new NameAndType("Model", "Microsoft.EntityFrameworkCore.Metadata.IModel", new List<string>()));
            expectedFields.Add(new NameAndType("Notifications", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Notification]", new List<string>()));
            expectedFields.Add(new NameAndType("People", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Person]", new List<string>()));
            expectedFields.Add(new NameAndType("PersonNotifications", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.PersonNotification]", new List<string>()));
            expectedFields.Add(new NameAndType("Roles", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Role]", new List<string>()));
            expectedFields.Add(new NameAndType("Spaces", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Space]", new List<string>()));
            expectedFields.Add(new NameAndType("SystemPermissions", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.SystemPermission]", new List<string>()));
            expectedFields.Add(new NameAndType("Tags", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Tag]", new List<string>()));
            expectedFields.Add(new NameAndType("TeamPermissions", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.TeamPermission]", new List<string>()));
            expectedFields.Add(new NameAndType("TeamPpsDepartments", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.TeamPpsDepartment]", new List<string>()));
            expectedFields.Add(new NameAndType("Teams", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Team]", new List<string>()));
            expectedFields.Add(new NameAndType("Users", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.User]", new List<string>()));
            expectedFields.Add(new NameAndType("WorkstationAssignments", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.WorkstationAssignment]", new List<string>()));
            expectedFields.Add(new NameAndType("WorkstationAttributes", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.WorkstationAttribute]", new List<string>()));
            expectedFields.Add(new NameAndType("Workstations", "Microsoft.EntityFrameworkCore.DbSet`1[Keas.Core.Domain.Workstation]", new List<string>()));                        
            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(ApplicationDbContext));
        }

        #endregion Reflection of Database
    }
}
