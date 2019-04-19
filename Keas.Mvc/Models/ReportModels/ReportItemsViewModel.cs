using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models.ReportModels
{
    public class ReportItemsViewModel
    {
        public AccessAssignment[] Access { get; set; }
        public KeySerial[] Keys { get; set; }
        public Equipment[] Equipment { get; set; }
        public Workstation[] Workstations { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Display(Name = "Expires before")]
        public DateTime ExpiresBefore { get; set; }

        public List<String> ItemList { get; set; }
        public String ShowType { get; set; }


        public static async Task<ReportItemsViewModel> CreateExpiry(ApplicationDbContext context, DateTime expiresBefore, string teamName, string showType, string[] userRoles, ISecurityService _securityService)
        {

            var expiringAccess = await context.AccessAssignments.Where(a => (showType == "All" || showType == "Access") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.AccessMaster)) &&
                a.Access.Team.Slug == teamName && a.ExpiresAt <= expiresBefore)
                .Include(a => a.Access).Include(a => a.Person).AsNoTracking().ToArrayAsync();
            var expiringKey = await context.KeySerials.Where(a => (showType == "All" || showType == "Key") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.KeyMaster)) &&
                a.Key.Team.Slug == teamName && a.KeySerialAssignment.ExpiresAt <= expiresBefore)
                .Include(k => k.KeySerialAssignment).ThenInclude(a => a.Person).Include(k => k.Key).AsNoTracking().ToArrayAsync();
            var expiringEquipment = await context.Equipment.Where(a => (showType == "All" || showType == "Equipment") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.EquipmentMaster)) &&
                a.Team.Slug == teamName && a.Assignment.ExpiresAt <= expiresBefore)
                .Include(e => e.Assignment).ThenInclude(a => a.Person).AsNoTracking().ToArrayAsync();
            var expiringWorkstations = await context.Workstations.Where(a => (showType == "All" || showType == "Workstation") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.SpaceMaster)) &&
                a.Team.Slug == teamName && a.Assignment.ExpiresAt <= expiresBefore)
                .Include(w => w.Assignment).ThenInclude(a => a.Person).AsNoTracking().ToArrayAsync();

            var itemList = populateItemList(userRoles, _securityService, true);
            var viewModel = new ReportItemsViewModel
            {
                Access = expiringAccess,
                Keys = expiringKey,
                Equipment = expiringEquipment,
                Workstations = expiringWorkstations,
                ExpiresBefore = expiresBefore,
                ItemList = itemList,
                ShowType = showType
            };
            return viewModel;
        }

        public static async Task<ReportItemsViewModel> CreateUnaccepted(ApplicationDbContext context, string teamName, string showType, string[] userRoles, ISecurityService _securityService)
        {
            var expiringKey = await context.KeySerials.Where(a => (showType == "All" || showType == "Key") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.KeyMaster)) &&
                a.Key.Team.Slug == teamName && !a.KeySerialAssignment.IsConfirmed)
                .Include(k => k.KeySerialAssignment).ThenInclude(a => a.Person).Include(k => k.Key)
                .AsNoTracking().ToArrayAsync();
            var expiringEquipment = await context.Equipment.Where(a => (showType == "All" || showType == "Equipment") &&
                 (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.EquipmentMaster)) &&
                  a.Team.Slug == teamName && !a.Assignment.IsConfirmed)
                .Include(e => e.Assignment).ThenInclude(a => a.Person)
                .AsNoTracking().ToArrayAsync();
            var expiringWorkstations = await context.Workstations.Where(a => (showType == "All" || showType == "Workstation") &&
                (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.SpaceMaster)) &&
                    a.Team.Slug == teamName && !a.Assignment.IsConfirmed)
                .Include(w => w.Assignment).ThenInclude(a => a.Person)
                .AsNoTracking().ToArrayAsync();

            var itemList = populateItemList(userRoles, _securityService, false);
            var viewModel = new ReportItemsViewModel
            {
                Keys = expiringKey,
                Equipment = expiringEquipment,
                Workstations = expiringWorkstations,
                ItemList = itemList,
                ShowType = showType
            };
            return viewModel;
        }

        public static List<string> populateItemList(string[] userRoles, ISecurityService _securityService, bool includeAccess)
        {
            var itemList = new List<string>() { "All" };

            if (includeAccess && _securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.AccessMaster))
            {
                itemList.Add("Access");
            }

            if (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.EquipmentMaster))
            {
                itemList.Add("Equipment");
            }

            if (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.KeyMaster))
            {
                itemList.Add("Key");
            }

            if (_securityService.IsRoleNameOrDAInArray(userRoles, Role.Codes.SpaceMaster))
            {
                itemList.Add("Workstation");
            }

            return itemList;

        }
    }
}
