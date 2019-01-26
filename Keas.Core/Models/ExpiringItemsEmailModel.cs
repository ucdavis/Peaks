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
            var list = new List<int>();
            list.AddRange(AccessAssignments.Select(a => a.PersonId));
            list.AddRange(KeySerials.Select(a => a.KeySerialAssignment.PersonId));
            list.AddRange(Equipment.Select(a => a.Assignment.PersonId));
            list.AddRange(Workstations.Select(a => a.Assignment.PersonId));
            return list.Distinct().ToList();
        }

        public IList<int> GetTeamIdList()
        {
            var list = new List<int>();
            list.AddRange(AccessAssignments.Select(a => a.Access.TeamId));
            list.AddRange(KeySerials.Select(a => a.TeamId));
            list.AddRange(Equipment.Select(a => a.TeamId));
            list.AddRange(Workstations.Select(a => a.TeamId));
            return list.Distinct().ToList();
        }
    }
}
