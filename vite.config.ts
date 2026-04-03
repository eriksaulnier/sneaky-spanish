import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig(({ mode }) => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

  if (mode === 'firefox') {
    manifest.background = {
      scripts: [manifest.background.service_worker],
    };
  }

  return {
    plugins: [webExtension({ manifest: () => manifest })],
  };
});
