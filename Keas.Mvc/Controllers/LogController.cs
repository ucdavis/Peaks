using System;
using Keas.Mvc.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Keas.Mvc.Controllers
{
    [Authorize]
    public class LogController : SuperController
    {
        [HttpPost]
        [IgnoreAntiforgeryToken]
        public IActionResult SendLogMessage([FromBody]ClientLogMessage[] data)
        {
            foreach (var message in data)
            {
                var logger = Log.Logger
                    .ForContext("source", "browser")
                    .ForContext("messageBody", message, true); // lgtm [cs/log-forging]

                if (string.Equals(message.Level, "trace", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Verbose(message.Message);
                }
                else if (string.Equals(message.Level, "debug", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Debug(message.Message);
                }
                else if (string.Equals(message.Level, "info", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Information(message.Message);
                }
                else if (string.Equals(message.Level, "warn", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Warning(message.Message);
                }
                else if (string.Equals(message.Level, "error", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Error(message.Message);
                }
                else if (string.Equals(message.Level, "fatal", StringComparison.OrdinalIgnoreCase))
                {
                    logger.Fatal(message.Message);
                }
                else
                {
                    logger.Information(message.Message);
                }
            }

            return new JsonResult(new { success = true });
        }
    }
}
