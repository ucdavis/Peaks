using System;
using Microsoft.EntityFrameworkCore;

namespace Keas.Core.Domain
{
    public class Document : AssetBase {
        public Person Person { get; set; }
        public int PersonId { get; set; }
        public string EnvelopeId { get; set; }
        // template that creates this envelope, for grouping documents
        public string TemplateId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string AccountId { get; set; }
        public string ApiBasePath { get; set; }

        protected internal static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Document>().HasQueryFilter(a => a.Active);
        }
    }
}
