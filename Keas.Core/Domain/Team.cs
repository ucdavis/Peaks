using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Keas.Core.Domain
{
    public class Team
    {
        [Key]
        public int Id { get; set; }

        // TODO: make this a unique field
        [StringLength(128)]
        [Display(Name = "Team Name")]
        [Required]
        public string Name { get; set; }

        [Display(Name = "Team Slug")]
        [Required]
        [StringLength(40, MinimumLength = 3, ErrorMessage = "Slug must be between 3 and 40 characters")]
        [RegularExpression(SlugRegex,
            ErrorMessage = "Slug may only contain lowercase alphanumeric characters or single hyphens, and cannot begin or end with a hyphen")]
        public string Slug { get; set; }

        public const string SlugRegex = "^([a-z0-9]+[a-z0-9\\-]?)+[a-z0-9]$";

        public List<Person> People { get; set; }

        [JsonIgnore]
        public ICollection<TeamPermission> TeamPermissions { get; set; }

        public List<FinancialOrganization> FISOrgs { get; set; }

        public List<TeamPpsDepartment> PpsDepartments { get; set; }
       
    }
}
