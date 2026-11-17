"""Exercise ngrok process readiness/cleanup without interrupting the live demo."""
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('launcher', Path(__file__).with_name('mcp-demo-launch.py'))
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


class LauncherTests(unittest.TestCase):
    def spawn_tunnel(self, source):
        actual_popen = subprocess.Popen
        processes = []

        def spawn(args, **kwargs):
            self.assertIn('--inspect=false', args)
            self.assertIn('--upstream-tls-verify', args)
            process = actual_popen([sys.executable, '-u', '-c', source], stdin=subprocess.PIPE, **kwargs)
            processes.append(process)
            return process

        return spawn, processes

    def test_ready_event_starts_tunnel_and_cleanup_stops_owned_process(self):
        spawn, processes = self.spawn_tunnel(
            'import json,sys; print(json.dumps({"msg":"started tunnel","addr":"https://localhost:5446",'
            '"url":"https://demo.ngrok-free.app"})); sys.stdin.read()')
        with tempfile.TemporaryDirectory() as directory, patch.object(launcher, 'LOCAL', Path(directory)), \
                patch.object(launcher, 'run'), patch.object(launcher.subprocess, 'Popen', side_effect=spawn):
            process = launcher.start_tunnel()
            try:
                self.assertIsNone(process.poll())
            finally:
                launcher.stop_tunnel(process)
                process.stdin.close()
            self.assertIsNotNone(process.returncode)
            self.assertEqual(1, len(processes))

    def test_exit_before_ready_fails_without_leaving_a_process(self):
        spawn, processes = self.spawn_tunnel('print("authentication failed")')
        with tempfile.TemporaryDirectory() as directory, patch.object(launcher, 'LOCAL', Path(directory)), \
                patch.object(launcher, 'run'), patch.object(launcher.subprocess, 'Popen', side_effect=spawn):
            with self.assertRaisesRegex(RuntimeError, 'ngrok did not start'):
                launcher.start_tunnel()
            self.assertIsNotNone(processes[0].poll())
            processes[0].stdin.close()

    def test_existing_foreign_tunnel_is_rejected(self):
        with patch.object(launcher, 'request', return_value=(200, {}, '{"tunnels": []}')):
            with self.assertRaisesRegex(RuntimeError, 'Another ngrok session'):
                launcher.tunnel_url()

    def test_preflight_rejects_wrong_issuer_challenge(self):
        with patch.object(launcher, 'request', return_value=(401, {'WWW-Authenticate': 'Bearer localhost'}, '')):
            with self.assertRaisesRegex(RuntimeError, 'public metadata URL'):
                launcher.check('https://demo.ngrok-free.app')


if __name__ == '__main__':
    unittest.main()
