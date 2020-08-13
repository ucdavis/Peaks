using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using DocuSign.eSign.Model;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Services
{
    public interface IDocumentSigningService
    {
        Task<Stream> DownloadEnvelope(string envelopeId);
        Task<EnvelopesInformation> GetEnvelopes(string email);
        Task<string> SendTemplate(string signerEmail, string signerName, string templateId);
    }

    public class DocumentSigningService : IDocumentSigningService
    {
        private DateTime _authExpires = DateTime.UtcNow;
        private DocuSign.eSign.Client.Auth.OAuth.OAuthToken _authToken;
        protected static ApiClient _apiClient { get; private set; }

        private readonly DocumentSigningSettings _documentSigningSettings;

        public DocumentSigningService(IOptions<DocumentSigningSettings> documentSigningSettings)
        {
            _apiClient = _apiClient ?? new ApiClient();
            _documentSigningSettings = documentSigningSettings.Value;
        }

        public async Task<string> SendTemplate(string signerEmail, string signerName, string templateId)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient());
            var envelope = new EnvelopeDefinition { TemplateId = templateId };

            // TODO: be able to handle other role names?  or at least document why we need this one
            var signer = new TemplateRole { Email = signerEmail, Name = signerName, RoleName = "signer" };
            envelope.TemplateRoles = new List<TemplateRole> { signer };
            envelope.Status = "sent";

            var result = await envelopesApi.CreateEnvelopeAsync(_documentSigningSettings.AccountId, envelope);

            return result.EnvelopeId;
        }

        public async Task<EnvelopesInformation> GetEnvelopes(string email)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient());
            var options = new EnvelopesApi.ListStatusChangesOptions();
            options.fromDate = DateTime.Now.AddDays(-30).ToString("yyyy/MM/dd");
            options.userName = email;

            return await envelopesApi.ListStatusChangesAsync(_documentSigningSettings.AccountId, options);
        }

        public async Task<Stream> DownloadEnvelope(string envelopeId)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient());

            return await envelopesApi.GetDocumentAsync(_documentSigningSettings.AccountId, envelopeId, "combined");
        }

        private Configuration GetApiClient()
        {
            var token = GetToken();

            var config = new Configuration(new ApiClient(_documentSigningSettings.ApiBasePath));
            config.AddDefaultHeader("Authorization", "Bearer " + token.access_token);

            return config;
        }

        // Returns a valid oauth token
        // If the previous token is still valid, return that, otherwise fetch a new token and store it
        private DocuSign.eSign.Client.Auth.OAuth.OAuthToken GetToken()
        {
            if (IsTokenValid())
            {
                return _authToken;
            }

            _authToken = new ApiClient().RequestJWTUserToken(_documentSigningSettings.ClientId, _documentSigningSettings.ImpersonatedUserId, _documentSigningSettings.AuthServer, _documentSigningSettings.PrivateKeyBytes, 1);

            // got a new token, set our expiration to the value in the auth token expires_in, or default to one hour
            _authExpires = DateTime.UtcNow.AddSeconds((double)(_authToken.expires_in.HasValue ? _authToken.expires_in : 3600));

            return _authToken;
        }

        public bool IsTokenValid()
        {
            return _authToken != null
                    && (DateTime.UtcNow < _authExpires);
        }
    }
}