using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using DocuSign.eSign.Client.Auth;
using DocuSign.eSign.Model;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Services
{
    public interface IDocumentSigningService
    {
        Task<Stream> DownloadEnvelope(Core.Domain.Team team, string envelopeId);
        string GetEnvelopePath(string envelopeId);
        Task<EnvelopesInformation> GetEnvelopes(Core.Domain.Team team, string email);
        Task<EnvelopesInformation> GetEnvelopes(Core.Domain.Team team, string[] envelopeIds);
        Task<EnvelopeTemplate> GetTemplate(Core.Domain.Team team, string templateId);
        Task<IEnumerable<EnvelopeTemplate>> GetTemplates(Core.Domain.Team team);
        Task<EnvelopeSummary> SendTemplate(Core.Domain.Document document);
        OAuth.UserInfo GetUserInfo();
    }

    public class DocumentSigningService : IDocumentSigningService
    {
        private static readonly string ReminderFrequency = "7"; // send reminders once a week
        private DateTime _authExpires = DateTime.UtcNow;
        private DocuSign.eSign.Client.Auth.OAuth.OAuthToken _authToken;
        protected static ApiClient _apiClient { get; private set; }

        private readonly DocumentSigningSettings _documentSigningSettings;

        private OAuth.UserInfo _userInfo;

        public DocumentSigningService(IOptions<DocumentSigningSettings> documentSigningSettings)
        {
            _apiClient ??= new ApiClient();
            _documentSigningSettings = documentSigningSettings.Value;
        }

        public OAuth.UserInfo GetUserInfo()
        {
            if (_userInfo != null)
                return _userInfo;

            var apiClient = new ApiClient(_documentSigningSettings.ApiBasePath);
            var token = GetToken();
            _userInfo = apiClient.GetUserInfo(token.access_token);

            return _userInfo;
        }

        public async Task<EnvelopeSummary> SendTemplate(Core.Domain.Document document)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient(document.ApiBasePath));
            var envelope = new EnvelopeDefinition { TemplateId = document.TemplateId };

            // Only handle templtes with single role named "signer"
            var signer = new TemplateRole { Email = document.Person.Email, Name = document.Person.Name, RoleName = "signer" };
            envelope.TemplateRoles = new List<TemplateRole> { signer };

            // get webhook callbacks for completion events
            var events = new[] {
                new EnvelopeEvent { EnvelopeEventStatusCode = "completed" },
                new EnvelopeEvent { EnvelopeEventStatusCode = "declined" },
                new EnvelopeEvent { EnvelopeEventStatusCode = "voided" }
            };
            envelope.EventNotification = new EventNotification { 
                Url = _documentSigningSettings.CallbackUrlBase + "/" + _documentSigningSettings.CallbackUrlSecret,
                RequireAcknowledgment = "true",

                EnvelopeEvents = events.ToList() 
            };

            envelope.Notification = new Notification {
                UseAccountDefaults = "false", // we want to customize notifications
                Reminders = new Reminders {
                    ReminderEnabled = "true",
                    ReminderDelay = ReminderFrequency, // first reminder will be sent after N days
                    ReminderFrequency = ReminderFrequency // keep sending reminders every N days after delay
                }
            };

            envelope.Status = "sent";

            if (!string.IsNullOrEmpty(_documentSigningSettings.BrandId)) {
                envelope.BrandId = _documentSigningSettings.BrandId;
            }

            return await envelopesApi.CreateEnvelopeAsync(document.AccountId, envelope);
        }

        public async Task<EnvelopeTemplate> GetTemplate(Core.Domain.Team team, string templateId)
        {
            var templatesApi = new TemplatesApi(GetApiClient(team.DocumentApiBasePath));
            var templateInfo = await templatesApi.GetAsync(team.DocumentAccountId, templateId);

            return templateInfo;
        }

        public async Task<IEnumerable<EnvelopeTemplate>> GetTemplates(Core.Domain.Team team)
        {
            var templatesApi = new TemplatesApi(GetApiClient(team.DocumentApiBasePath));
            var options = new TemplatesApi.ListTemplatesOptions();
            var envelopeTemplates = new List<EnvelopeTemplate>();
            var startPosition = "0";

            do
            {
                options.startPosition = startPosition;
                var templateInfo = await templatesApi.ListTemplatesAsync(team.DocumentAccountId, options);
                envelopeTemplates.AddRange(templateInfo.EnvelopeTemplates ?? new List<EnvelopeTemplate>());
                startPosition = envelopeTemplates.Count < int.Parse(templateInfo.TotalSetSize)
                    ? (int.Parse(templateInfo.EndPosition) + 1).ToString() 
                    : null;

            } while (startPosition != null);

            return envelopeTemplates;
        }

        public async Task<EnvelopesInformation> GetEnvelopes(Core.Domain.Team team, string email)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient(team.DocumentApiBasePath));
            var options = new EnvelopesApi.ListStatusChangesOptions();
            options.fromDate = DateTime.Now.AddDays(-30).ToString("yyyy/MM/dd");
            options.userName = email;

            return await envelopesApi.ListStatusChangesAsync(team.DocumentAccountId, options);
        }

        public async Task<EnvelopesInformation> GetEnvelopes(Core.Domain.Team team, string[] envelopeIds)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient(team.DocumentApiBasePath));
            var options = new EnvelopesApi.ListStatusChangesOptions();
            options.envelopeIds = string.Join(",", envelopeIds);

            return await envelopesApi.ListStatusChangesAsync(team.DocumentAccountId, options);
        }

        public async Task<Stream> DownloadEnvelope(Core.Domain.Team team, string envelopeId)
        {
            var envelopesApi = new EnvelopesApi(GetApiClient(team.DocumentApiBasePath));

            return await envelopesApi.GetDocumentAsync(team.DocumentAccountId, envelopeId, "combined");
        }

        private Configuration GetApiClient(string apiBasePath)
        {
            var token = GetToken();

            var config = new Configuration(new ApiClient(apiBasePath + "/restapi"));
            config.AddDefaultHeader("Authorization", "Bearer " + token.access_token);

            return config;
        }

        public string GetEnvelopePath(string envelopeId) {
            return _documentSigningSettings.WebBasePath + envelopeId;
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
