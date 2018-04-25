using System;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain {
    public class History {
        public History()
        {
            ActedDate = DateTime.UtcNow;
        }
        public int Id { get; set; }

        [Required]
        public string Description { get; set; }

        public User Actor { get; set; }
        public string ActorName { get; set; }

        public DateTime ActedDate { get; set; }

        public Person Person { get; set; }
        public int PersonId { get; set; }

        // Key vs Equipment vs Access 
        public string AssetType { get; set; }

        // Created, granted, accepted, declined, revoked, deleted 
        public string ActionType { get; set; }

        public Key Key {get;set;}
        public Equipment Equipment { get; set; }

        public Access Access { get; set; }

    }
}