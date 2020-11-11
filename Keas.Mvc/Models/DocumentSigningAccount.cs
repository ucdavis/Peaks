
using System;
using System.ComponentModel;

namespace Keas.Mvc.Models
{
    public class DocumentSigningAccount {

        [DisplayName("Account Id")]
        public string AccountId { get; set; }

        [DisplayName("Account Name")]
        public string AccountName { get; set; }
        
        [DisplayName("Api Base Url")]
        public string ApiBasePath { get; set; }
        
        public bool IsDefault { get; set; }
    }
}
