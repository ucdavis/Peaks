using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;
using Moq;
using Keas.Mvc.Infrastructure.Vite;

namespace Test.Integration
{
    public class ViteDevelopmentServerTests
    {
        [Theory]
        [InlineData("Production", true)]
        [InlineData("Staging", true)]
        [InlineData("Development", false)]
        public async Task DisabledServerDoesNotRequireNodeOrClientFiles(string environment, bool enabled)
        {
            using var fixture = new ServerFixture();
            using var server = fixture.CreateServer(environment, enabled, nodePath: "missing-peaks-test-node");

            await server.StartAsync(CancellationToken.None);
            await server.StopAsync(CancellationToken.None);

            Assert.False(File.Exists(fixture.PidFile));
            fixture.Lifetime.Verify(x => x.StopApplication(), Times.Never);
        }

        [Fact]
        public async Task ReadyServerAcceptsRequestsAndShutdownReleasesItsPort()
        {
            using var fixture = new ServerFixture();
            fixture.WriteServerScript();
            using var server = fixture.CreateServer();

            await server.StartAsync(CancellationToken.None);
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
            Assert.Equal("peaks-vite-test", await http.GetStringAsync(fixture.Url));

            await server.StopAsync(CancellationToken.None);

            await fixture.AssertProcessExited();
            fixture.AssertPortAvailable();
            fixture.Lifetime.Verify(x => x.StopApplication(), Times.Never);
        }

        [Fact]
        public async Task OccupiedPortFailsWithoutStoppingTheExistingListener()
        {
            using var fixture = new ServerFixture();
            using var existingListener = new TcpListener(IPAddress.Loopback, fixture.Port);
            existingListener.Start();
            fixture.WriteServerScript();
            using var server = fixture.CreateServer();

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => server.StartAsync(CancellationToken.None));

            using var connection = new TcpClient();
            await connection.ConnectAsync(IPAddress.Loopback, fixture.Port);
            Assert.True(connection.Connected, "The launcher must leave the existing listener alone.");
            await fixture.AssertProcessExited();
        }

        [Fact]
        public async Task FailedStartupReportsFailureAndLeavesNoChildRunning()
        {
            using var fixture = new ServerFixture();
            fixture.WriteScript("console.error('fixture startup failed'); process.exit(41);");
            using var server = fixture.CreateServer();

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => server.StartAsync(CancellationToken.None));

            await fixture.AssertProcessExited();
        }

        [Fact]
        public async Task UnexpectedExitStopsTheApplicationInsteadOfLeavingBrokenAssetLinks()
        {
            using var fixture = new ServerFixture();
            fixture.WriteServerScript("console.log('PEAKS_VITE_READY:' + process.env.PEAKS_VITE_TOKEN); setTimeout(() => process.exit(43), 250);");
            var stopped = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
            fixture.Lifetime.Setup(x => x.StopApplication()).Callback(() => stopped.TrySetResult());
            using var server = fixture.CreateServer();

            await server.StartAsync(CancellationToken.None);
            await stopped.Task.WaitAsync(TimeSpan.FromSeconds(5));

            fixture.Lifetime.Verify(x => x.StopApplication(), Times.Once);
            await fixture.AssertProcessExited();
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task ShutdownKillsOnlyItsChildIfGracefulStopDoesNotFinish(bool dispose)
        {
            using var fixture = new ServerFixture();
            fixture.WriteServerScript(ignoreInputEnd: true);
            using var server = fixture.CreateServer();
            await server.StartAsync(CancellationToken.None);
            using var process = Process.GetProcessById(int.Parse(File.ReadAllText(fixture.PidFile)));

            if (dispose) server.Dispose();
            else await server.StopAsync(CancellationToken.None);

            Assert.True(process.HasExited, "Shutdown must wait for the owned process to exit.");
            Directory.Delete(fixture.ClientDirectory, recursive: true);
            fixture.AssertPortAvailable();
            fixture.Lifetime.Verify(x => x.StopApplication(), Times.Never);
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task MissingOrUnrelatedReadySignalTimesOutAndCleansUp(bool unrelatedSignal)
        {
            using var fixture = new ServerFixture();
            fixture.WriteServerScript(unrelatedSignal ? "console.log('PEAKS_VITE_READY:another-process');" : "");
            using var server = fixture.CreateServer(startupTimeoutSeconds: 1);

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => server.StartAsync(CancellationToken.None));

            Assert.True(File.Exists(fixture.PidFile), "The test must exercise a launched process.");
            await fixture.AssertProcessExited();
            fixture.AssertPortAvailable();
        }

        private sealed class ServerFixture : IDisposable
        {
            private readonly string _root = Path.Combine(Path.GetTempPath(), "peaks-vite-" + Guid.NewGuid().ToString("N"));

            public ServerFixture()
            {
                Directory.CreateDirectory(Path.Combine(ClientDirectory, "scripts"));
                using var listener = new TcpListener(IPAddress.Loopback, 0);
                listener.Start();
                Port = ((IPEndPoint)listener.LocalEndpoint).Port;
            }

            public int Port { get; }
            public string Url => $"http://localhost:{Port}";
            public string ClientDirectory => Path.Combine(_root, "client");
            public string PidFile => Path.Combine(_root, "server.pid");
            public Mock<IHostApplicationLifetime> Lifetime { get; } = new Mock<IHostApplicationLifetime>();

            public ViteDevelopmentServer CreateServer(string environment = "Development", bool enabled = true,
                string nodePath = "node", int startupTimeoutSeconds = 5)
            {
                var host = new Mock<IWebHostEnvironment>();
                host.SetupGet(x => x.EnvironmentName).Returns(environment);
                host.SetupGet(x => x.ContentRootPath).Returns(_root);
                var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["Vite:UseDevServer"] = enabled.ToString(),
                    ["Vite:DevServerUrl"] = Url,
                    ["Vite:ClientDirectory"] = ClientDirectory,
                    ["Vite:NodePath"] = nodePath,
                    ["Vite:StartupTimeoutSeconds"] = startupTimeoutSeconds.ToString()
                }).Build();
                return new ViteDevelopmentServer(host.Object, configuration,
                    NullLogger<ViteDevelopmentServer>.Instance, Lifetime.Object);
            }

            public void WriteServerScript(string readySignal = "console.log('PEAKS_VITE_READY:' + process.env.PEAKS_VITE_TOKEN);", bool ignoreInputEnd = false)
            {
                WriteScript($$"""
                    import { createServer } from 'node:http';
                    const server = createServer((request, response) => response.end('peaks-vite-test'));
                    server.on('error', error => { console.error(error.message); process.exit(42); });
                    server.listen({{Port}}, '127.0.0.1', () => { {{readySignal}} });
                    process.stdin.resume();
                    process.stdin.on('end', () => { {{(ignoreInputEnd ? "" : "server.close(() => process.exit(0));")}} });
                    """);
            }

            public void WriteScript(string script)
            {
                File.WriteAllText(Path.Combine(ClientDirectory, "scripts", "dev-server.mjs"),
                    $"import {{ writeFileSync }} from 'node:fs';\nwriteFileSync({JsonSerializer.Serialize(PidFile)}, String(process.pid));\n" + script);
            }

            public async Task AssertProcessExited()
            {
                if (!File.Exists(PidFile)) return;
                try
                {
                    using var process = Process.GetProcessById(int.Parse(File.ReadAllText(PidFile)));
                    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                    await process.WaitForExitAsync(timeout.Token);
                }
                catch (ArgumentException) { /* The OS has already reaped the process. */ }
            }

            public void AssertPortAvailable()
            {
                using var listener = new TcpListener(IPAddress.Loopback, Port);
                listener.Start();
            }

            public void Dispose()
            {
                if (File.Exists(PidFile))
                {
                    try
                    {
                        using var process = Process.GetProcessById(int.Parse(File.ReadAllText(PidFile)));
                        if (!process.HasExited) process.Kill(entireProcessTree: true);
                        process.WaitForExit(5000);
                    }
                    catch (ArgumentException) { }
                    catch (InvalidOperationException) { }
                }
                Directory.Delete(_root, recursive: true);
            }
        }
    }
}
