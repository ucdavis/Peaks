namespace Keas.Core.Domain
{
    public class Document : AssetBase {
        public Person Person { get; set; }
        public int PersonId { get; set; }
        public string EnvelopeId { get; set; }
        // template that creates this envelope, for grouping documents
        public string TemplateId { get; set; }
        public string Status { get; set; }
    }
}
