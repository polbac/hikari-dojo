import { defineConfig } from 'vite';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Copia scripts clásicos (sin type=module) al dist de producción. */
function copyClassicScripts() {
  return {
    name: 'copy-classic-scripts',
    closeBundle() {
      const from = resolve('js');
      const to = resolve('dist/js');
      if (!existsSync(from)) return;
      mkdirSync(to, { recursive: true });
      cpSync(from, to, { recursive: true });
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: false,
  plugins: [copyClassicScripts()],
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
