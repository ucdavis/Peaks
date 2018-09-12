using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class ExpiringItemsViewModel
    {
        public IQueryable<AccessAssignment> AccessAssignments { get; set; }
        public IQueryable<Serial> Keys { get; set; }
        public IQueryable<Equipment> Equipment { get; set; }
        public IQueryable<Workstation> Workstations { get; set; }
       

        public static ExpiringItemsViewModel Create(IQueryable<AccessAssignment> access, IQueryable<Serial> keys, IQueryable<Equipment> equipment, IQueryable<Workstation> workstations)
        {
            var viewModel = new ExpiringItemsViewModel
            {
                AccessAssignments = access,
                Keys = keys,
                Equipment = equipment,
                Workstations = workstations
            };
            return viewModel;
        }
    }
}
