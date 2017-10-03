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

        // TODO: Maybe move this out to a teamLocation table? Otherwise, we have folks fighting over this???
        public int QualityRating { get; set; }
        
        public string Type { get; set; }

        
        [ForeignKey("ParentLocationId")]
        public Location ParentLocation { get; set; }
        public int? ParentLocationId { get; set; }

        //[Required]
        //public Team Team { get; set; }
        //public int TeamId { get; set; }

        // TODO: If locations are now public, should assets show up? Maybe force the cascade load only when needed?
        //public List<Asset> Assets { get; set; }

    }
}
