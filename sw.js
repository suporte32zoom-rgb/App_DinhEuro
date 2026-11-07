/**
 * DinhEuro Service Worker - Versão 'dinheuro-v2-cache'
 * Arquitetura PWA resiliente e defensiva:
 * - Zero chamadas a window.location.reload()
 * - Zero loops de recarregamento
 * - Estratégia Network-First para APIs financeiras com fallback gracioso
 * - Suporte offline completo para assets estáticos
 */

const CACHE_NAME = 'dinheuro-v2-cache';

const STATIC_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/logo.png',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

// Instalação do Service Worker e pré-cache de assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn('[DinhEuro SW] Falha ao pré-cachear alguns itens:', err);
      });
    }).then(() => {
      // Ativa imediatamente o novo service worker sem esperar fechamento das abas
      return self.skipWaiting();
    })
  );
});

// Ativação e limpeza cirúrgica de caches obsoletos (ex: v1, legados)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[DinhEuro SW] Removendo cache obsoleto:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Assume o controle de todos os clientes sem forçar reload
      return self.clients.claim();
    })
  );
});

// Interceptação defensiva de requisições de rede
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignora métodos não-GET (POST, PUT, DELETE, etc.)
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  // Ignora requisições de extensões de navegador ou esquemas não-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. APIs Financeiras (Awesome API, Finnhub, Coinbase, CoinGecko, ECB, FMP):
  // Estratégia Network-First com cache de contingência silencioso
  const isFinancialApi =
    url.hostname.includes('awesomeapi.com.br') ||
    url.hostname.includes('finnhub.io') ||
    url.hostname.includes('coinbase.com') ||
    url.hostname.includes('coingecko.com') ||
    url.hostname.includes('frankfurter.dev') ||
    url.hostname.includes('financialmodelingprep.com') ||
    url.pathname.startsWith('/api/');

  if (isFinancialApi) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // Se a resposta for válida, armazena no cache para uso offline
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback gracioso: tenta retornar o último dado em cache
          const cachedResponse = await caches.match(req);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se não houver cache, retorna JSON vazio seguro (sem quebrar a aplicação)
          return new Response(JSON.stringify({ offline: true, error: 'Offline mode' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // 2. Navegação SPA (rotas como /mercados, /day-trade, /carteiras):
  // Tenta rede primeiro, com fallback para o index.html em cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) {
          return cachedIndex;
        }
        return caches.match('/');
      })
    );
    return;
  }

  // 3. Assets Estáticos (JS, CSS, Imagens, Fontes):
  // Estratégia Stale-While-Revalidate para velocidade máxima
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
