#!/usr/bin/env python3
"""Launch the disposable PEAKS demo; keep a newly started ngrok process attached."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import threading
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
LOCAL = ROOT / '.local/mcp'


def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)


def demo(command):
    run('bash', 'scripts/mcp-demo.sh', command)


def request(url):
    try:
        response = urllib.request.urlopen(url, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read().decode()


def tunnel_url():
    try:
        status, _, body = request('http://127.0.0.1:4040/api/tunnels')
    except urllib.error.URLError:
        return None
    if status != 200:
        raise RuntimeError('The ngrok agent API on port 4040 did not return its tunnels.')
    matches = [t for t in json.loads(body)['tunnels']
               if t['config']['addr'] == 'https://localhost:5446'
               and t['public_url'].startswith('https://') and t['config']['inspect'] is False]
    if len(matches) != 1:
        raise RuntimeError('Another ngrok session is using port 4040. Stop it yourself or use the documented demo tunnel command.')
    origin = matches[0]['public_url'].rstrip('/')
    if not re.fullmatch(r'https://[a-z0-9-]+\.(?:ngrok-free\.app|ngrok-free\.dev|ngrok\.app|ngrok\.dev)', origin):
        raise RuntimeError('Expected an ngrok HTTPS origin.')
    return origin


def check(origin):
    if origin is None:
        raise RuntimeError('No demo tunnel is running. Run bash scripts/mcp-demo.sh demo.')
    status, headers, _ = request(origin + '/mcp')
    metadata_url = origin + '/.well-known/oauth-protected-resource/mcp'
    if status != 401 or metadata_url not in headers.get('WWW-Authenticate', ''):
        raise RuntimeError('MCP must return 401 with the public metadata URL. Run the public command to sync the issuer.')
    for path in ('/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-authorization-server'):
        status, _, body = request(origin + path)
        if status != 200:
            raise RuntimeError('OAuth discovery failed at ' + path)
        data = json.loads(body)
        if path.endswith('/mcp'):
            valid = data.get('resource') == origin + '/mcp' and data.get('authorization_servers') == [origin + '/']
        else:
            valid = (data.get('issuer') == origin + '/'
                     and all(data.get(key) == origin + '/oauth/' + suffix for key, suffix in
                             [('authorization_endpoint', 'authorize'), ('token_endpoint', 'token'), ('registration_endpoint', 'register')])
                     and 'S256' in data.get('code_challenge_methods_supported', [])
                     and data.get('token_endpoint_auth_methods_supported') == ['none']
                     and 'peaks.inventory.read' in data.get('scopes_supported', []))
        if not valid:
            raise RuntimeError('OAuth metadata does not match this tunnel: ' + path)
    status, _, body = request(origin + '/login')
    if status != 200 or '/login/local' not in body:
        raise RuntimeError('The public PEAKS local-login page is unavailable.')
    print('PASS: public HTTPS, MCP challenge, OAuth/PKCE/DCR metadata and login page.', flush=True)


def start_tunnel():
    run('openssl', 'pkcs12', '-in', str(LOCAL / 'localhost.pfx'), '-passin', 'pass:peaks-local-demo',
        '-clcerts', '-nokeys', '-out', str(LOCAL / 'localhost.crt'))
    process = subprocess.Popen([
        'ngrok', 'http', 'https://localhost:5446', '--inspect=false', '--upstream-tls-verify',
        '--upstream-tls-verify-cas', str(LOCAL / 'localhost.crt'), '--log=stdout', '--log-format=json'
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, start_new_session=True)
    ready = threading.Event()
    started = []

    def read_events():
        # Keep draining stdout while the launcher runs; never capture HTTP requests or token bodies.
        with (LOCAL / 'ngrok-agent.log').open('a') as log, process.stdout:
            for line in process.stdout:
                log.write(line)
                log.flush()
                try:
                    event = json.loads(line)
                except ValueError:
                    continue
                if event.get('msg') == 'started tunnel' and event.get('addr') == 'https://localhost:5446':
                    started.append(event['url'])
                    ready.set()
        ready.set()  # Process exited before readiness; wake the caller immediately.

    threading.Thread(target=read_events, daemon=True).start()
    try:
        if not ready.wait(45) or not started or process.poll() is not None:
            raise RuntimeError('ngrok did not start. Check .local/mcp/ngrok-agent.log and ngrok account authentication.')
        return process
    except BaseException:
        stop_tunnel(process)
        raise


def stop_tunnel(process):
    if process is not None and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--build', action='store_true', help='Rebuild the sandbox before starting; run ahead of demo day.')
    parser.add_argument('--check', action='store_true', help='Check the running public endpoints without changing anything.')
    args = parser.parse_args()
    if args.check:
        check(tunnel_url())
        return
    for executable in ('docker', 'ngrok', 'openssl') + (('dotnet',) if args.build else ()):
        if shutil.which(executable) is None:
            raise RuntimeError('Missing prerequisite: ' + executable)
    os.umask(0o077)
    LOCAL.mkdir(parents=True, exist_ok=True)
    existing = tunnel_url()
    owned = None
    try:
        if subprocess.run(['docker', 'info'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
            run('docker', 'desktop', 'start', '--timeout', '90')
        demo('start' if args.build else 'resume')
        if existing is None:
            print('Starting ngrok; waiting for its tunnel-ready event...', flush=True)
            owned = start_tunnel()
        else:
            print('Reusing the running demo tunnel.', flush=True)
        origin = tunnel_url()
        demo('public')
        demo('refresh-dates')
        check(origin)
        print(f'\nPEAKS demo is ready.\nServer URL: {origin}/mcp\nLogin: sandbox-admin\n'
              f'Grants / revoke: {origin}/oauth/connections\nSign out: {origin}/logout\n'
              'If the URL changed, update/re-add PEAKS Demo in Codex. Sign in again on demo day; grants last eight hours.\n'
              'Final check in Try Now: What Apple equipment does Javier Morales have?', flush=True)
        if owned is not None:
            print('Leave this terminal open. Ctrl+C stops this tunnel; Docker data stays intact.', flush=True)
            if owned.wait() != 0:
                raise RuntimeError('ngrok stopped unexpectedly. Check .local/mcp/ngrok-agent.log.')
        else:
            print('Keep the existing ngrok process running. This command did not take ownership of it.', flush=True)
    finally:
        stop_tunnel(owned)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nLauncher stopped. Docker and any pre-existing tunnel are left running.')
    except (RuntimeError, subprocess.CalledProcessError, urllib.error.URLError, ValueError) as error:
        sys.exit('Demo setup failed: ' + str(error))
