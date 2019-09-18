using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Models;
using Microsoft.Extensions.Options;
using Bigfix;

namespace Keas.Mvc.Services
{
    public interface IBigfixService
    {
        Task<string> TestOs();
        Task<string> TestLookupComputer();
        Task<BigfixComputerSearchResult[]> GetComputersByName(string name);
        Task<BigFixComputerProperties> GetComputer(string id);
    }

    public class BigfixService : IBigfixService
    {
        private readonly BigfixSettings _bigfixSettings;

        public BigfixService(IOptions<BigfixSettings> bigfixSettings)
        {
            _bigfixSettings = bigfixSettings.Value;
        }

        public async Task<string> TestOs()
        {
            using (var bf = GetClient())
            {
                var results = await bf.Computers.Get("1677559868");

                var os = results.Get(ComputerProperty.OS);
                return os;
            }
        }

        public async Task<string> TestLookupComputer()
        {
            using (var bf = GetClient())
            {
                var query = bf.Queries.Common.GroupedQueries.GetComputerByNameEquals("CAES-7TW1H12");

                var results = await bf.Queries.SearchWithGroupedResults(query);

                return $"BF Id {results.AllAnswers[0].Value} -- Computer Name {results.AllAnswers[1].Value}";
            }
        }
        public async Task<BigfixComputerSearchResult[]> GetComputersByName(string name)
        {
           using (var bf = GetClient())
            {
                var query = bf.Queries.Common.GroupedQueries.GetComputerByNameEquals(name);

                var results = await bf.Queries.SearchWithGroupedResults(query);

                var searchResults = results.Tuples.Select(t => new BigfixComputerSearchResult {
                    Id = t.Answers[0].Value,
                    Name = t.Answers[1].Value
                }).ToArray();

                return searchResults;
            }
        }

        public async Task<BigFixComputerProperties> GetComputer(string id)
        {
            try {
                using (var bf = GetClient())
                {
                    var results = await bf.Computers.Get(id);

                    return new BigFixComputerProperties(results);
                }
            } 
            catch (Exception)
            {
                return null;
            }
            

        }

        private BigfixClient GetClient()
        {
            return new BigfixClient(_bigfixSettings.UserName, _bigfixSettings.Password);
        }
    }

     public class BigfixComputerSearchResult
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
