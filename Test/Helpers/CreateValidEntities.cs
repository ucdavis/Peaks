using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Domain;

namespace Test.Helpers
{
    public static class CreateValidEntities
    {

        public static User User(int? counter, bool populateAllFields = false)
        {
            var rtValue = new User();
            rtValue.FirstName = string.Format("FirstName{0}", counter);
            rtValue.LastName = string.Format("LastName{0}", counter);

            if (populateAllFields)
            {
            }

            rtValue.Id = (counter ?? 99).ToString();

            return rtValue;

        }
    }
}
