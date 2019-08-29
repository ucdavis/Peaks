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

        public async Task<BigFixComputerProperties> GetComputer(string id)
        {
            using (var bf = GetClient())
            {
                var results = await bf.Computers.Get(id);

                return new BigFixComputerProperties(results);
            }
        }


        private BigfixClient GetClient()
        {
            return new BigfixClient(_bigfixSettings.UserName, _bigfixSettings.Password);
        }
    }
}
