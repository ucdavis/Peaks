// Launched by .NET with a dedicated stdin pipe, never by an interactive terminal.
// Keeping Vite in this process lets EOF clean up even after a debugger force-stop.
import { createServer } from 'vite';

const token = process.env.PEAKS_VITE_TOKEN;
if (!token) throw new Error('Start PEAKS with npm start or Visual Studio F5.');
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  throw new Error('PEAKS requires Node.js 22.18 or newer.');
}

let stopping = false;
let server;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(code), 3000);
  try {
    await server?.close();
  } finally {
    clearTimeout(deadline);
    process.exit(code);
  }
}
process.stdin.on('end', () => void stop());
process.stdin.on('error', () => void stop(1));
process.stdin.resume();
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

try {
  server = await createServer();
  await server.listen();
  server.printUrls();
  process.stdout.write(`PEAKS_VITE_READY:${token}\n`);
} catch (error) {
  console.error(error);
  await stop(1);
}
