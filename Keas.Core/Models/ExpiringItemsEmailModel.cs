using System;
using System.Linq;
using Keas.Core.Domain;

namespace Keas.Core.Models
{
    public class ExpiringItemsEmailModel
    {
        public IQueryable<AccessAssignment> AccessAssignments { get; set; }
        public IQueryable<KeySerial> KeySerials { get; set; }
        public IQueryable<Equipment> Equipment { get; set; }
        public IQueryable<Workstation> Workstations { get; set; }
        public Person Person { get; set; }


        public static ExpiringItemsEmailModel Create(IQueryable<AccessAssignment> access, IQueryable<KeySerial> keySerials, IQueryable<Equipment> equipment, IQueryable<Workstation> workstations, Person person)
        {
            var viewModel = new ExpiringItemsEmailModel
            {
                AccessAssignments = access,
                KeySerials = keySerials,
                Equipment = equipment,
                Workstations = workstations,
                Person = person
            };
            return viewModel;
        }
    }
}
