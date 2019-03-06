using System;
using System.Collections.Generic;
using System.Text;

namespace Keas.Core.Models
{
    public class SpaceSearchModel
    {
        //.Select(a => new {a.BldgName, a.DeptName, a.ChartNum, a.OrgId}).Distinct().ToListAsync();
        public string BldgName { get; set; }                    
        public string DeptName { get; set; }
        public string ChartNum { get; set; }
        public string OrgId { get; set; }
    }
}
