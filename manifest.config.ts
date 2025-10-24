import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
  },
  permissions: ['webNavigation', 'storage', 'tabs', 'notifications'],
  background: {
    service_worker: 'src/background/worker.ts',
  },
  chrome_url_overrides: {
    newtab: 'src/newtab/index.html',
  },
  web_accessible_resources: [
    {
      resources: ['src/block/index.html', 'src/assets/*', 'assets/*'],
      matches: ['<all_urls>'],
    },
  ],
  content_scripts: [
    {
      js: ['src/content/main.tsx'],
      matches: ['https://*/*'],
    },
  ],
});
