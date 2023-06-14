using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        public string ActorId { get; set; }
       

        public DateTime ActedDate { get; set; }

        public Person Target { get; set; }
        public int? TargetId { get; set; }

        // Key vs Equipment vs Access 
        public string AssetType { get; set; }

        // Created, granted, accepted, declined, revoked, deleted 
        public string ActionType { get; set; }
       
        public Key Key {get;set;}
        public int? KeyId { get; set; }

        public KeySerial KeySerial { get; set; }
        public int? KeySerialId { get; set; }

        public Equipment Equipment { get; set; }
        public int? EquipmentId { get; set; }

        public Access Access { get; set; }
        public int? AccessId { get; set; }

        public Workstation Workstation { get; set; }
        public int? WorkstationId { get; set; }

        public Document Document { get; set; }
        public int? DocumentId { get; set; }
        [NotMapped]
        public string Link
        {
            get
            {
                //Need to insert team
                if (EquipmentId != null)
                {
                    return $"/equipment/details/{EquipmentId.Value}";
                }

                if (KeySerialId != null && KeyId != null) //Note, prior to this PR, the key id wasn't being tracked.
                {
                    return $"/keys/details/{KeyId.Value}/keyserials/details/{KeySerialId.Value}";
                }
               
                if(KeyId != null)
                {
                    return $"/keys/details/{KeyId.Value}";
                }

                if (AccessId != null)
                {
                    return $"/access/details/{AccessId.Value}";
                }

                if(DocumentId != null && TargetId != null)
                {
                    return $"/people/details/{TargetId}";
                }
                
                //Can't really do workstations, as they are related to spaces/people and we don't track the space id here

                return null;
            }
        }
    }
}
