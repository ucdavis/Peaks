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
        public IQueryable<AccessAssignment> AccessAssignments { get; set; }
        public IQueryable<Serial> Keys { get; set; }
        public IQueryable<Equipment> Equipment { get; set; }
        public IQueryable<Workstation> Workstations { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:d}", ApplyFormatInEditMode = true)]
        [Display(Name = "Expires before")]
        public DateTime ExpiresBefore { get; set; }

        [Display(Name = "Show Inactive Items?")]
        public bool ShowInactive { get; set; }
       

        public static ExpiringItemsViewModel Create(ApplicationDbContext context, DateTime expiresBefore, string teamName, bool showInactive)
        {
            // AccessAssignement needs db update to link back to Access.
            //var expiringAccess = context.AccessAssignments.Where(a => a.ExpiresAt <= expiresBefore).Include(a => a.Access).AsNoTracking();
            var expiringKey = context.Serials.Where(a =>
                a.Key.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Key.Active || a.Key.Active == !showInactive))
                .Include(k => k.Assignment).ThenInclude(a=> a.Person).Include(k => k.Key).AsNoTracking();
            var expiringEquipment = context.Equipment.Where(a =>
                  a.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Active || a.Active == !showInactive))
                .Include(e => e.Assignment).ThenInclude(a=> a.Person).AsNoTracking();
            var expiringWorkstations = context.Workstations.Where(a =>
                    a.Team.Name == teamName && a.Assignment.ExpiresAt <= expiresBefore && (a.Active || a.Active == !showInactive))
                .Include(w => w.Assignment).ThenInclude(a=> a.Person).AsNoTracking();
            var viewModel = new ExpiringItemsViewModel
            {
                Keys = expiringKey,
                Equipment = expiringEquipment,
                Workstations = expiringWorkstations,
                ExpiresBefore = expiresBefore,
                ShowInactive = showInactive
            };
            return viewModel;
        }
    }
}
