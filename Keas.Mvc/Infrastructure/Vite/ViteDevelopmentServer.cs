using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Keas.Mvc.Infrastructure.Vite
{
    // Owns only the development asset server. Routing and production assets stay in MVC.
    public sealed class ViteDevelopmentServer : IHostedService, IDisposable
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ViteDevelopmentServer> _logger;
        private readonly IHostApplicationLifetime _lifetime;
        private Process _process;
        private volatile bool _stopping;
        private volatile bool _ready;

        public ViteDevelopmentServer(IWebHostEnvironment environment, IConfiguration configuration,
            ILogger<ViteDevelopmentServer> logger, IHostApplicationLifetime lifetime)
        {
            _environment = environment;
            _configuration = configuration;
            _logger = logger;
            _lifetime = lifetime;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            if (!_environment.IsDevelopment() || !_configuration.GetValue<bool>("Vite:UseDevServer")) return;

            var address = _configuration["Vite:DevServerUrl"] ?? "http://localhost:5179";
            if (!Uri.TryCreate(address, UriKind.Absolute, out var uri) || uri.Scheme != "http" ||
                uri.Host != "localhost" || uri.AbsolutePath != "/" || uri.Query != "" ||
                uri.Fragment != "" || uri.UserInfo != "" || uri.Port < 1)
                throw new InvalidOperationException("Vite:DevServerUrl must be an http://localhost:<port> origin.");

            var client = Path.GetFullPath(_configuration["Vite:ClientDirectory"] ?? "ClientApp", _environment.ContentRootPath);
            var script = Path.Combine(client, "scripts", "dev-server.mjs");
            if (!File.Exists(script))
                throw new InvalidOperationException($"Vite development launcher was not found at {script}.");

            var timeoutSeconds = _configuration.GetValue("Vite:StartupTimeoutSeconds", 30);
            if (timeoutSeconds <= 0)
                throw new InvalidOperationException("Vite:StartupTimeoutSeconds must be positive.");

            var token = Guid.NewGuid().ToString("N");
            var ready = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            var start = new ProcessStartInfo(_configuration["Vite:NodePath"] ?? "node")
            {
                WorkingDirectory = client,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            start.ArgumentList.Add(script);
            start.Environment["FRONTEND_ASSET_URL"] = uri.GetLeftPart(UriPartial.Authority);
            start.Environment["PEAKS_VITE_TOKEN"] = token;
            // Keep stdin open for our lifetime. EOF also cleans up Vite if F5 forcibly terminates .NET.
            _process = new Process { StartInfo = start, EnableRaisingEvents = true };
            _process.OutputDataReceived += (_, args) =>
            {
                if (args.Data == "PEAKS_VITE_READY:" + token) ready.TrySetResult(true);
                else if (!string.IsNullOrWhiteSpace(args.Data)) _logger.LogInformation("{ViteOutput}", args.Data);
            };
            _process.ErrorDataReceived += (_, args) =>
            {
                if (!string.IsNullOrWhiteSpace(args.Data)) _logger.LogWarning("{ViteOutput}", args.Data);
            };
            _process.Exited += (_, _) =>
            {
                ready.TrySetException(new InvalidOperationException("Vite exited before it was ready. See its output above."));
                if (_ready && !_stopping)
                {
                    _logger.LogError("Vite exited unexpectedly. Stopping the development app; restart after correcting the error above.");
                    _lifetime.StopApplication();
                }
            };

            try
            {
                _process.Start();
                _process.BeginOutputReadLine();
                _process.BeginErrorReadLine();
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                timeout.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));
                await ready.Task.WaitAsync(timeout.Token);
                _ready = true;
                if (_process.HasExited) throw new InvalidOperationException("Vite exited during startup. See its output above.");
                _logger.LogInformation("Vite assets ready at {Address}", uri.GetLeftPart(UriPartial.Authority));
            }
            catch (Exception exception)
            {
                await StopAsync(CancellationToken.None);
                if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested) throw;
                var message = exception switch
                {
                    Win32Exception => "Could not start Node.js. Install Node.js 22.18 or newer and restart Visual Studio or your terminal. Vite:NodePath can specify its full path.",
                    OperationCanceledException => $"Vite did not become ready within {timeoutSeconds} seconds. See its output above.",
                    _ => "Could not start the Vite development server. See its output above."
                };
                throw new InvalidOperationException(message, exception);
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            _stopping = true;
            if (_process == null) return;
            try
            {
                if (_process.HasExited) return;
                _process.StandardInput.Close();
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                timeout.CancelAfter(TimeSpan.FromSeconds(5));
                await _process.WaitForExitAsync(timeout.Token);
            }
            catch (OperationCanceledException)
            {
                KillOwnedProcess();
            }
            catch (InvalidOperationException) { /* The process never started or has already exited. */ }
            catch (IOException)
            {
                KillOwnedProcess();
            }
        }

        private void KillOwnedProcess()
        {
            try
            {
                if (_process != null && !_process.HasExited) _process.Kill(entireProcessTree: true);
            }
            catch (InvalidOperationException) { /* Already exited. */ }
            catch (Win32Exception exception)
            {
                _logger.LogWarning(exception, "Could not stop the owned Vite process.");
            }
        }

        public void Dispose()
        {
            _stopping = true;
            KillOwnedProcess();
            _process?.Dispose();
        }
    }
}
