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

        public int QualityRating { get; set; }
        
        public string Type { get; set; }

        public int? ParentLocationId { get; set; }

       
        [ForeignKey("ParentLocationId")]
        public Location ParentLocation { get; set; }


    }
}
