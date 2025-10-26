import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    crx({
      manifest,
    }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  build: {
    rollupOptions: {
      input: {
        block: path.resolve(__dirname, 'src/block/index.html'),
        newtab: path.resolve(__dirname, 'src/newtab/index.html'),
        options: path.resolve(__dirname, 'src/options/index.html'),
        welcome: path.resolve(__dirname, 'src/welcome/index.html'),
      },
    },
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
