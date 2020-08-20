namespace Keas.Core.Domain
{
    public class TeamDocumentSetting {
        public int Id { get; set; }
        public Team Team { get; set; }
        public int TeamId { get; set; }
        public string TemplateId { get; set; }
        public string Name { get; set; }
    }
}
