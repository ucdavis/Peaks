using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Keas.Core.Domain
{
    public class Location
    {
        [Required]
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        // TODO: External IDs go here

        public string Type { get; set; }

        //[ForeignKey("Id")]
        //public Location ParentLocation { get; set; }


    }
}
