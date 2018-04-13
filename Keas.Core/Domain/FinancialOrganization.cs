using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class FinancialOrganization
    {

        [Key]
        public int Id { get; set; }

        [StringLength(1)]
        [Required]
        public string Chart { get; set; }

        [StringLength(4)]
        [Required]
        public string OrgCode { get; set; }
        
        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }

        public string ChartAndOrg => string.Format("{0}-{1}", Chart, OrgCode);

    }
}
