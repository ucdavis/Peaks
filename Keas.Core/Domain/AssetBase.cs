using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Keas.Core.Domain
{
    public abstract class AssetBase
    {
        public AssetBase()
        {
            Active = true;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(64)]
        public string Name { get; set; }

        [StringLength(32)]
        public string Group { get; set; }

        // Comma Separated List of Search Tags
        public string Tags { get; set; }

        public Team Team { get; set; }
        public int TeamId { get; set; }

        public bool Active { get; set; }

        public string GetDescription(string asset, string title, Person person, string action)
        {
            return asset + "(" + title + ") " + action + " by " + person.Name + " (" + person.UserId + ")";
        }

        public virtual string Title => Name;
    }
}
