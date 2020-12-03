using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;


namespace Keas.Mvc.Services
{
    public class ServiceNowService
    {
        static readonly HttpClient client = new HttpClient();

        static async Task GetComputer(string id)
        {
            try
            {
                HttpResponseMessage response = await client.GetAsync("http://www.contoso.com/");
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                Console.WriteLine(responseBody);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("Invalid id");
                Console.WriteLine("Message :{0} ", e.Message);
            }
        }
    }

    public class ExternalAssets
    {
        public string Url { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
