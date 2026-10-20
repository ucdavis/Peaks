import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import test from 'node:test';

async function port() {
  const listener = createServer();
  listener.listen(0, 'localhost');
  await once(listener, 'listening');
  return listener;
}
function launch(origin, token = 'launcher-test') {
  const child = spawn(process.execPath, ['scripts/dev-server.mjs'], {
    env: { ...process.env, FRONTEND_ASSET_URL: origin, PEAKS_VITE_TOKEN: token },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  const exited = once(child, 'exit');
  return { child, exited, output: () => output };
}

test('real Vite becomes ready, serves modules and CSS, then releases its port on stdin EOF', { timeout: 30000 }, async () => {
  const listener = await port();
  const number = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const origin = `http://localhost:${number}`;
  const run = launch(origin);
  try {
    const deadline = Date.now() + 20000;
    while (!run.output().includes('PEAKS_VITE_READY:launcher-test')) {
      assert.equal(run.child.exitCode, null, run.output());
      assert.ok(Date.now() < deadline, run.output());
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const response = await fetch(`${origin}/src/index.tsx`, { headers: { Origin: 'https://localhost:44332' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://localhost:44332');
    assert.match(await response.text(), /renderApp/);
    const css = await fetch(`${origin}/src/sass/site.scss?direct`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type'), /text\/css/);
    assert.match(await css.text(), /\.peaks-nav/);
    const font = await fetch(`${origin}/media/fonts/proximanova-regular-webfont.woff`);
    assert.equal(font.status, 200);
    assert.ok((await font.arrayBuffer()).byteLength > 1000);
    run.child.stdin.end();
    assert.equal((await run.exited)[0], 0, run.output());
    const probe = createServer();
    probe.listen(number, 'localhost');
    await once(probe, 'listening');
    await new Promise(resolve => probe.close(resolve));
  } finally {
    if (run.child.exitCode === null) run.child.kill();
    await run.exited;
  }
});

test('occupied port fails without stopping the other listener', { timeout: 15000 }, async () => {
  const listener = await port();
  try {
    const run = launch(`http://localhost:${listener.address().port}`);
    assert.notEqual((await run.exited)[0], 0);
    assert.match(run.output(), /already in use/);
    assert.equal(listener.listening, true);
  } finally {
    await new Promise(resolve => listener.close(resolve));
  }
});
