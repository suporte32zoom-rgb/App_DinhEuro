import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
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
        '@': path.resolve(process.cwd(), '.'),
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
