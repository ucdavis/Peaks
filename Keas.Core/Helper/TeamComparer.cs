using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;


namespace Keas.Core.Helper
{
    public class TeamComparer : IEqualityComparer<Team>
    {
        public bool Equals(Team t1, Team t2)
        {
            return t1.Id == t2.Id;
        }

        public int GetHashCode(Team t)
        {
            return t.Id;
        }
    }
}