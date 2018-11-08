using System;
using System.Linq;
using Keas.Core.Domain;

namespace Keas.Core.Models
{
    public class ExpiringItemsEmailModel
    {
        public IList<AccessAssignment> AccessAssignments { get; set; }
        public IList<Serial> Keys { get; set; }
        public IList<Equipment> Equipment { get; set; }
        public IList<Workstation> Workstations { get; set; }

        public IList<Person> People { get; set; }
        public Person Person { get; set; }


        public static ExpiringItemsEmailModel Create(IList<AccessAssignment> access, IList<Serial> keys, IList<Equipment> equipment, IList<Workstation> workstations, Person person)
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
                .Union(Keys.Select(a => a.Assignment.PersonId).Distinct())
                .Union(Equipment.Select(a => a.Assignment.PersonId).Distinct())
                .Union(Workstations.Select(a => a.Assignment.PersonId)).Distinct().ToList();
        }
    }
}
