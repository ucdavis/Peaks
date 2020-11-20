using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Domain;

namespace Keas.Mvc.Models
{
    public class TeamDocumentSettingsModel
    {
        public List<DocumentSigningAccount> AvailableAccounts { get; set; }
        public List<TeamDocumentSetting> TeamDocumentSettings { get; set; }
        public DocumentSigningAccount TeamAccount { get; set; }

        public List<string> TemplateNames { get; set; } = new List<string>();

    }
}
