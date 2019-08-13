using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Rewrite.Internal.ApacheModRewrite;
using Microsoft.Extensions.Options;
using Bigfix;

namespace Keas.Mvc.Services
{
    public interface IBigfixService
    {
        Task Test();
    }

    public class BigfixService : IBigfixService
    {
        private readonly BigfixSettings _bigfixSettings;

        public BigfixService(IOptions<BigfixSettings> bigfixSettings)
        {
            _bigfixSettings = bigfixSettings.Value;
        }

        public async Task Test()
        {
            var bf = new BigfixClient(_bigfixSettings.UserName, _bigfixSettings.Password);

            var results = await bf.Computers.Get("1677559868");

            var os = results.OS;

        }
    }
}
