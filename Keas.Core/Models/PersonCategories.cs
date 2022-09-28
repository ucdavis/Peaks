using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    public class PersonCategories
    {
        const string Faculty = "Faculty";
        const string Research = "Research";
        const string Staff = "Staff";
        const string AdminStaff = "Admin Staff";
        const string GradStudent = "Grad Student";
        const string Postdoc = "Postdoc";
        const string Undergrad = "Undergrad";
        const string Visitor = "Visitor";
        const string Volunteer = "Volunteer";
        const string AdjunctFaculty = "Adjunct Faculty";
        const string Lecturer = "Lecturer";

        public static List<string> Types = new List<string>
        {
            Faculty,
            Research,
            Staff,
            AdminStaff,
            GradStudent,
            Postdoc,
            Undergrad,
            Visitor,
            Volunteer,
            AdjunctFaculty,
            Lecturer
        };

    }
}
