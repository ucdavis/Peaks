using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    public class PersonCategories
    {
        const string Faculty = "Faculty";
        const string Staff = "Staff";
        const string AdminStaff = "Admin Staff";
        const string GradStudent = "Grad Student";
        const string Undergrad = "Undergrad";
        const string Visitor = "Visitor";
        const string Volunteer = "Volunteer";

        public static List<string> Types = new List<string>
        {
            Faculty,
            Staff,
            AdminStaff,
            GradStudent,
            Undergrad,
            Visitor,
            Volunteer,
        };

    }
}
