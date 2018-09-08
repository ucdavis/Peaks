using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Core.Models
{
    public class ExpiringItemsEmailModel
    {
        public List<AccessAssignment> AccessAssignments { get; set; }
        public IQueryable<Serial> Keys { get; set; }
        public IQueryable<Equipment> Equipment { get; set; }
        public IQueryable<Workstation> Workstations { get; set; }
        public Person Person { get; set; }


        public static ExpiringItemsEmailModel Create(IQueryable<Serial> keys, IQueryable<Equipment> equipment, IQueryable<Workstation> workstations, Person person)
        {
            var viewModel = new ExpiringItemsEmailModel
            {
                Keys = keys,
                Equipment = equipment,
                Workstations = workstations,
                Person = person
            };
            return viewModel;
        }
    }
}
