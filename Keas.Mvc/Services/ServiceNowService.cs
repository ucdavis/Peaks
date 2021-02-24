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
        Task<ServiceNowPropertyWrapper> GetComputersByProperty(string property);
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

        public async Task<ServiceNowPropertyWrapper> GetComputersByProperty(string property)
        {
            // Using ServiceNow's API we can chain requests with ^OR
            string nameQuery = "?sysparm_query=hardware_u_device_nameLIKE" + property;
            string userNameQuery = "^ORuser_user_nameLIKE" + property;
            string ipAddressQuery = "^ORhardware_u_ip_addressLIKE" + property;
            string macAddressQuery = "^ORhardware_u_mac_addressLIKE" + property;
            string serialNumberQuery = "^ORhardware_serial_numberLIKE" + property;
            string endUrl = "&sysparm_display_value=true&sysparm_exclude_reference_link=true&sysparm_limit=5";
            StringBuilder fullUrl = new StringBuilder(_serviceNowSettings.ApiBasePath);
            fullUrl.Append(nameQuery);
            fullUrl.Append(userNameQuery);
            fullUrl.Append(ipAddressQuery);
            fullUrl.Append(macAddressQuery);
            fullUrl.Append(serialNumberQuery);
            fullUrl.Append(endUrl);

            using (var client = GetClient())
            {
                HttpResponseMessage response = await client.GetAsync(fullUrl.ToString());
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
