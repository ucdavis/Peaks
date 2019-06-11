using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class GroupPermission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Group Group { get; set; }
        public int GroupId { get; set; }

        [Required]
        public User User { get; set; }
        public string UserId { get; set; }
    }
}
