using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Models
{
    public class ExpiringItemsViewModel
    {
        public AccessAssignment[] AccessAssignments { get; set; }
        public Serial[] Keys { get; set; }
        public Equipment[] Equipment { get; set; }
        public Workstation[] Workstations { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:d}", ApplyFormatInEditMode = true)]
        [Display(Name = "Expires before")]
        public DateTime ExpiresBefore { get; set; }

        [Display(Name = "Show Inactive Items?")]
        public bool ShowInactive { get; set; }

        public List<String> ItemList { get; set; }
        public String ShowType { get; set; }
       

        public static async Task<ExpiringItemsViewModel> Create(ApplicationDbContext context, DateTime expiresBefore, string teamName, bool showInactive, string showType)
        {
            // AccessAssignement needs db update to link back to Access.
            //var expiringAccess = context.AccessAssignments.Where(a => a.ExpiresAt <= expiresBefore).Include(a => a.Access).AsNoTracking();
            //var expiringAccess = context.Access.Where(a => (showType == "All" || showType == "Access") &&
            //                                             a.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Access.Active || a.Access.Active == !showInactive))
            //    .Include(a => a.Assignment).ThenInclude(a => a.Person).AsNoTracking();
            var expiringKey = await context.Serials.Where(a => (showType == "All" || showType == "Key") &&
                a.Key.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Key.Active || a.Key.Active == !showInactive))
                .Include(k => k.Assignment).ThenInclude(a=> a.Person).Include(k => k.Key).AsNoTracking().ToArrayAsync();
            var expiringEquipment = await context.Equipment.Where(a => (showType == "All" || showType == "Equipment") &&
                  a.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Active || a.Active == !showInactive))
                .Include(e => e.Assignment).ThenInclude(a=> a.Person).AsNoTracking().ToArrayAsync();
            var expiringWorkstations = await context.Workstations.Where(a => (showType == "All" || showType == "Workstation") &&
                    a.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Active || a.Active == !showInactive))
                .Include(w => w.Assignment).ThenInclude(a=> a.Person).AsNoTracking().ToArrayAsync();

            var itemList = new List<string>(new string[] {"All", "Access", "Equipment", "Key", "Workstation"});
            var viewModel = new ExpiringItemsViewModel
            {
                Keys = expiringKey,
                Equipment = expiringEquipment,
                Workstations = expiringWorkstations,
                ExpiresBefore = expiresBefore,
                ShowInactive = showInactive,
                ItemList =  itemList,
                ShowType = showType
            };
            return viewModel;
        }
    }
}
