
using System;

namespace Keas.Mvc.Models
{
    public class DocumentSigningSettings {
        public string ApiBasePath { get; set; } // used solely for obtaining OAuth.UserInfo
        public string AuthServer { get; set; }
        public string BrandId { get; set; }
        public string ClientId { get; set; }
        public string CallbackUrlBase { get; set; }
        public string CallbackUrlSecret { get; set; }
        public string ImpersonatedUserId { get; set; }
        public string PrivateKeyBase64 { get; set; }
        public string WebBasePath { get; set; }

        public byte[] PrivateKeyBytes {
            get {
                return string.IsNullOrEmpty(PrivateKeyBase64) ? new byte[0] : Convert.FromBase64String(PrivateKeyBase64);
            }
        }
    }
}
