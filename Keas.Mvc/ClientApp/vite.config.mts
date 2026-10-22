import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import browserslistToEsbuild from 'browserslist-to-esbuild';

const origin = new URL(
  process.env.FRONTEND_ASSET_URL || 'http://localhost:5179'
);

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Relative build URLs allow Razor's PathBase to locate the entire asset graph.
  base: './',
  // Legacy CSS root URLs resolve against the asset server in development.
  publicDir: command === 'serve' ? '../wwwroot' : false,
  server: {
    host: origin.hostname,
    port: Number(origin.port),
    strictPort: true,
    origin: origin.origin,
    cors: {
      origin: process.env.FRONTEND_MVC_ORIGIN
        ? [new URL(process.env.FRONTEND_MVC_ORIGIN).origin]
        : [
            'https://localhost:44332',
            'http://localhost:44331',
            'https://localhost:44331'
          ]
    }
  },
  build: {
    target: browserslistToEsbuild(),
    outDir: '../wwwroot/vite',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: { input: 'src/index.tsx' }
  }
}));
