using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;


namespace Keas.Core.Helper
{
    public class PersonComparer : IEqualityComparer<Person>
    {
        public bool Equals(Person p1, Person p2)
        {
            return p1.Id == p2.Id;
        }

        public int GetHashCode(Person p)
        {
            return p.Id;
        }
    }
}
