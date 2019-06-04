using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Models
{
    public class GroupTeamPostModel
    {
        public int GroupId { get; set; }

        public string GroupName { get; set; }
        [Required]
        public string TeamSlug { get; set; }
    }
}
