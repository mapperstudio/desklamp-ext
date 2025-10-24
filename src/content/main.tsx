import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { checkIfSiteIsBlocked } from './utils/domainChecker';
import App from './views/App';

console.log('Content script - Starting lightweight checker');

// Lightweight content script that only loads React when needed
(async () => {
  const isBlocked = await checkIfSiteIsBlocked();

  if (isBlocked) {
    console.log('Content script - Site is blocked, lazy loading React app');

    try {
      // Create container for React app
      const container = document.createElement('div');
      container.id = 'desklamp-app';
      document.body.appendChild(container);

      // App component is already imported

      // Mount React app
      const root = createRoot(container);
      root.render(
        React.createElement(StrictMode, null, React.createElement(App))
      );

      console.log('Content script - React app loaded successfully');
    } catch (error) {
      console.error('Content script - Error loading React app:', error);
    }
  } else {
    console.log('Content script - Site not blocked, skipping React app');
  }
})();
