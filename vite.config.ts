import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'DinhEuro - Hub Financeiro Global',
          short_name: 'DinhEuro',
          description: 'Hub financeiro global com cotações em tempo real, simulador de câmbio universal, ações mundiais e B3, cripto e carteiras.',
          theme_color: '#0B1320',
          background_color: '#0B1320',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'suppress-vite-hmr-ws-error',
        transformIndexHtml: {
          order: 'pre',
          handler() {
            return [
              {
                tag: 'script',
                attrs: { type: 'text/javascript' },
                injectTo: 'head-prepend',
                children: `
(function() {
  var NativeWS = window.WebSocket;
  if (NativeWS && typeof EventTarget !== 'undefined') {
    class MockViteWS extends EventTarget {
      constructor(url, protocols) {
        if (protocols === 'vite-hmr' || protocols === 'vite-ping' || (typeof url === 'string' && (url.indexOf('token=') !== -1 || url.indexOf('vite') !== -1))) {
          super();
          this.readyState = 1;
          this.url = url;
          this.protocol = protocols || '';
          setTimeout(() => {
            try { this.dispatchEvent(new Event('open')); } catch(e) {}
          }, 10);
        } else {
          return new NativeWS(url, protocols);
        }
      }
      send() {}
      close() {
        this.readyState = 3;
        try { this.dispatchEvent(new Event('close')); } catch(e) {}
      }
    }
    MockViteWS.CONNECTING = 0;
    MockViteWS.OPEN = 1;
    MockViteWS.CLOSING = 2;
    MockViteWS.CLOSED = 3;
    window.WebSocket = MockViteWS;
  }
  var origConsoleError = console.error;
  console.error = function() {
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      var str = (a && (a.message || a.stack || String(a))) || '';
      if (str.indexOf('WebSocket') !== -1 || str.indexOf('[vite]') !== -1 || str.indexOf('Illegal invocation') !== -1) {
        return;
      }
    }
    return origConsoleError.apply(console, arguments);
  };
})();
`,
              },
            ];
          },
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
