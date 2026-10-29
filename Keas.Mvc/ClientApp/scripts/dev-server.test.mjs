import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
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
    env: {
      ...process.env,
      FRONTEND_ASSET_URL: origin,
      PEAKS_VITE_TOKEN: token
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', data => {
    output += data;
  });
  child.stderr.on('data', data => {
    output += data;
  });
  const exited = once(child, 'exit');
  return { child, exited, output: () => output };
}

test(
  'real Vite serves and hot updates linked and imported CSS, then releases its port on stdin EOF',
  { timeout: 90000 },
  async t => {
    const started = Date.now();
    const reportPhase = phase => t.diagnostic(`${phase}: ${Date.now() - started}ms`);
    const fetchAsset = (url, options = {}) =>
      fetch(url, { ...options, signal: t.signal });
    const listener = await port();
    const number = listener.address().port;
    await new Promise(resolve => listener.close(resolve));
    const origin = `http://localhost:${number}`;
    const fixtureName = `hmr-style-test-${randomUUID()}.css`;
    const fixtureFile = new URL(fixtureName, import.meta.url);
    const fixturePath = `/scripts/${fixtureName}`;
    await writeFile(fixtureFile, '.hmr-fixture { color: rgb(1, 2, 3); }', {
      flag: 'wx'
    });
    const run = launch(origin);
    let socket;
    const stopRun = () => {
      socket?.close();
      if (run.child.exitCode === null) run.child.kill();
    };
    t.signal.addEventListener('abort', stopRun, { once: true });
    try {
      const deadline = Date.now() + 20000;
      while (!run.output().includes('PEAKS_VITE_READY:launcher-test')) {
        t.signal.throwIfAborted();
        assert.equal(run.child.exitCode, null, run.output());
        assert.ok(Date.now() < deadline, run.output());
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      reportPhase('server ready');
      const response = await fetchAsset(`${origin}/src/index.tsx`, {
        headers: { Origin: 'https://localhost:44332' }
      });
      assert.equal(response.status, 200);
      assert.equal(
        response.headers.get('access-control-allow-origin'),
        'https://localhost:44332'
      );
      assert.match(await response.text(), /renderApp/);
      const css = await fetchAsset(`${origin}/src/styles/main.css?direct`);
      assert.equal(css.status, 200);
      assert.match(css.headers.get('content-type'), /text\/css/);
      const styles = await css.text();
      assert.match(styles, /\.content-wrapper/);
      assert.match(styles, /--color-primary/);
      assert.match(styles, /data-theme=.?peaks/);
      const importedCss = await fetchAsset(`${origin}/src/styles/main.css`);
      assert.equal(importedCss.status, 200);
      assert.match(importedCss.headers.get('content-type'), /javascript/);
      const importedStyles = await importedCss.text();
      assert.match(importedStyles, /__vite__updateStyle/);
      assert.match(importedStyles, /import\.meta\.hot\.accept\(\)/);
      reportPhase('main CSS forms loaded');

      // The initial stylesheet link and later JavaScript import must both update.
      const linkedFixture = await fetchAsset(`${origin}${fixturePath}?direct`);
      assert.equal(linkedFixture.status, 200);
      assert.match(linkedFixture.headers.get('content-type'), /text\/css/);
      assert.match(await linkedFixture.text(), /rgb\(1, 2, 3\)/);
      const importedFixture = await fetchAsset(`${origin}${fixturePath}`);
      assert.equal(importedFixture.status, 200);
      assert.match(await importedFixture.text(), /__vite__updateStyle/);

      const updates = [];
      socket = new WebSocket(origin.replace('http:', 'ws:'), 'vite-hmr');
      socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
          updates.push(
            ...message.updates.filter(
              update => new URL(update.path, origin).pathname === fixturePath
            )
          );
        }
      });
      await once(socket, 'open', {
        signal: AbortSignal.any([t.signal, AbortSignal.timeout(5000)])
      });
      await writeFile(fixtureFile, '.hmr-fixture { border-color: rgb(4, 5, 6); }');
      const updateDeadline = Date.now() + 5000;
      while (
        !updates.some(update => update.type === 'css-update') ||
        !updates.some(update => update.type === 'js-update')
      ) {
        t.signal.throwIfAborted();
        assert.ok(
          Date.now() < updateDeadline,
          'Vite must hot update both the stylesheet link and JavaScript CSS import'
        );
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      const linkedUpdate = updates.find(update => update.type === 'css-update');
      const refreshedLink = await fetchAsset(
        `${origin}${fixturePath}?t=${linkedUpdate.timestamp}`,
        { headers: { Accept: 'text/css' } }
      );
      assert.match(refreshedLink.headers.get('content-type'), /text\/css/);
      const refreshedStyles = await refreshedLink.text();
      assert.match(refreshedStyles, /border-color: rgb\(4, 5, 6\)/);
      assert.doesNotMatch(refreshedStyles, /rgb\(1, 2, 3\)/);
      const refreshedImport = await fetchAsset(`${origin}${fixturePath}`);
      assert.match(await refreshedImport.text(), /border-color: rgb\(4, 5, 6\)/);
      reportPhase('fixture HMR passed');
      const socketClosed = once(socket, 'close', {
        signal: AbortSignal.any([t.signal, AbortSignal.timeout(5000)])
      });
      socket.close();
      await socketClosed;
      socket = undefined;
      const font = await fetchAsset(
        `${origin}/media/fonts/proximanova-regular-webfont.woff`
      );
      assert.equal(font.status, 200);
      assert.ok((await font.arrayBuffer()).byteLength > 1000);
      run.child.stdin.end();
      assert.equal((await run.exited)[0], 0, run.output());
      const probe = createServer();
      probe.listen(number, 'localhost');
      await once(probe, 'listening');
      await new Promise(resolve => probe.close(resolve));
      reportPhase('shutdown and port release passed');
    } finally {
      try {
        t.signal.removeEventListener('abort', stopRun);
        stopRun();
        await run.exited;
      } finally {
        await unlink(fixtureFile);
      }
    }
  }
);

test(
  'occupied port fails without stopping the other listener',
  { timeout: 15000 },
  async () => {
    const listener = await port();
    try {
      const run = launch(`http://localhost:${listener.address().port}`);
      assert.notEqual((await run.exited)[0], 0);
      assert.match(run.output(), /already in use/);
      assert.equal(listener.listening, true);
    } finally {
      await new Promise(resolve => listener.close(resolve));
    }
  }
);
