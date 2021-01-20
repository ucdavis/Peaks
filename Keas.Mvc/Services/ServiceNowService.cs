using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Keas.Mvc.Models;
using Newtonsoft.Json;
using Microsoft.Extensions.Options;

namespace Keas.Mvc.Services
{
    public interface IServiceNowService
    {
        Task<ServiceNowPropertyWrapper> GetComputersByName(string name);
        Task<ServiceNowPropertyWrapper> GetComputer(string id);
        string Base64Encode(string textToEncode);
    }

    public class ServiceNowService : IServiceNowService
    {
        private readonly ServiceNowSettings _serviceNowSettings;

        public ServiceNowService(IOptions<ServiceNowSettings> serviceNowSettings)
        {
            _serviceNowSettings = serviceNowSettings.Value;
        }

        public async Task<ServiceNowPropertyWrapper> GetComputersByName(string name)
        {
            string urlAddOns = "?sysparm_query=hardware_u_device_nameLIKE";
            string endUrl = "&sysparm_display_value=true&sysparm_exclude_reference_link=true&sysparm_limit=5";
            string fullUrl = _serviceNowSettings.ApiBasePath + urlAddOns + name + endUrl;

            using (var client = GetClient())
            {
                HttpResponseMessage response = await client.GetAsync(fullUrl);
                string responseBody = await response.Content.ReadAsStringAsync();
                ServiceNowPropertyWrapper ServiceNowResults = JsonConvert.DeserializeObject<ServiceNowPropertyWrapper>(responseBody);

                return ServiceNowResults;
            }
        }
        public async Task<ServiceNowPropertyWrapper> GetComputer(string id)
        {
            string urlAddOns = "?sysparm_query=hardware_u_bigfix_id=";
            string endUrl = "&sysparm_display_value=true&sysparm_exclude_reference_link=true&sysparm_limit=1";
            string fullUrl = _serviceNowSettings.ApiBasePath + urlAddOns + id + endUrl;

            using (var client = GetClient())
            {
                HttpResponseMessage response = await client.GetAsync(fullUrl);
                string responseBody = await response.Content.ReadAsStringAsync();
                ServiceNowPropertyWrapper ServiceNowResults = JsonConvert.DeserializeObject<ServiceNowPropertyWrapper>(responseBody);

                return ServiceNowResults;
            }
        }

        public string Base64Encode(string textToEncode)
        {
            byte[] textAsBytes = Encoding.UTF8.GetBytes(textToEncode);
            return Convert.ToBase64String(textAsBytes);
        }

        private HttpClient GetClient()
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add($"Authorization", $"Basic {Base64Encode($"{_serviceNowSettings.Username}:{_serviceNowSettings.Password}")}");

            return client;
        }

        public class ServiceNowApiException : Exception
        {
            public ServiceNowApiException(HttpStatusCode statusCode, string message){
                
            }

            public HttpStatusCode StatusCode { get; }
        }
    }
}
