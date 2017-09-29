using System;
using System.Collections.Generic;
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

        
        [ForeignKey("ParentLocationId")]
        public Location ParentLocation { get; set; }
        public int? ParentLocationId { get; set; }

        [Required]
        public Team Team { get; set; }
        public int TeamId { get; set; }

        public List<Asset> Assets { get; set; }

    }
}
