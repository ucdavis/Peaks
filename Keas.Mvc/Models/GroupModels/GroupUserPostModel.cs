using Keas.Core.Domain;

namespace Keas.Mvc.Models.GroupModels
{
    public class GroupUserPostModel
    {
        public Group Group { get; set; }
        public string UserEmail { get; set; }
    }
}
