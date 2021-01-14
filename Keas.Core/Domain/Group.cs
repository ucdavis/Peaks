using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Newtonsoft.Json;

namespace Keas.Core.Domain
{
    public class Group
    {
        [Key]
        public int Id { get; set; }

        // TODO: make this a unique field
        [StringLength(128)]
        [Display(Name = "Group Name")]
        [Required]
        public string Name { get; set; }

        [JsonIgnore]
        public List<GroupPermission> GroupPermissions { get; set; }

        [JsonIgnore]
        public List<GroupXTeam> Teams { get; set; }
    }
}
