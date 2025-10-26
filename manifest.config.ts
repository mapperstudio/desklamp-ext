import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  icons: {
    128: 'icon128.png',
    48: 'icon48.png',
    32: 'icon48.png',
    16: 'icon48.png',
  },
  action: {
    default_icon: {
      48: 'icon48.png',
      128: 'icon128.png',
    },
  },
  permissions: ['notifications', 'webNavigation', 'storage', 'tabs'],
  background: {
    service_worker: 'src/background/worker.ts',
  },
  web_accessible_resources: [
    {
      resources: ['src/*', 'public/*', 'assets/*', 'src/assets/*'],
      matches: ['<all_urls>'],
    },
  ],
  content_scripts: [
    {
      js: ['src/content/content-script.tsx'],
      matches: ['https://*/*'],
    },
  ],
  options_page: 'src/options/index.html',
  commands: {
    'focus-page': {
      suggested_key: {
        default: 'Ctrl+F',
        mac: 'Command+F',
      },
      description: 'Open Focus Page',
    },
    'break-page': {
      suggested_key: {
        default: 'Ctrl+B',
        mac: 'Command+B',
      },
      description: 'Open Break Page',
    },
    newtab: {
      suggested_key: {
        default: 'Ctrl+T',
        mac: 'Command+T',
      },
      description: 'Open New Tab',
    },
    settings: {
      suggested_key: {
        default: 'Ctrl+Shift+S',
        mac: 'Command+Shift+S',
      },
      description: 'Open Settings',
    },
  },
});
