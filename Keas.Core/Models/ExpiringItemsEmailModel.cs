using System;
using System.Collections.Generic;
using System.Linq;
using Keas.Core.Domain;

namespace Keas.Core.Models
{
    public class ExpiringItemsEmailModel
    {
        public IList<AccessAssignment> AccessAssignments { get; set; }
        public IList<KeySerial> KeySerials { get; set; }
        public IList<Equipment> Equipment { get; set; }
        public IList<Workstation> Workstations { get; set; }

        public IList<Person> People { get; set; }
        public Person Person { get; set; }


        public static ExpiringItemsEmailModel Create(IList<AccessAssignment> access, IList<KeySerial> keySerials, IList<Equipment> equipment, IList<Workstation> workstations, Person person)
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

        public IList<int> GetPersonIdList()
        {
            return AccessAssignments.Select(a => a.PersonId).Distinct()
                .Union(KeySerials.Select(a => a.Assignment.PersonId).Distinct())
                .Union(Equipment.Select(a => a.Assignment.PersonId).Distinct())
                .Union(Workstations.Select(a => a.Assignment.PersonId)).Distinct().ToList();
        }
    }
}
