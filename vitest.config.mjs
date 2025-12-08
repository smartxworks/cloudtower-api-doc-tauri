import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './cloudtower-api-doc'),
    },
  },
});

