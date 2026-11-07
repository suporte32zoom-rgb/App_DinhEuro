import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  validateWebhookHeader,
  processarEventoEmBackground,
  recentWebhookEvents,
  getWebhookStatus,
} from './src/server/webhookHandler';
import { getAggregatedMarketData } from './src/server/marketProxy';

dotenv.config();

// Enforce HMR disabled in AI Studio cloud container environment to prevent WebSocket closed errors
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Middleware para interpretar JSON no corpo da requisição
  app.use(express.json());

  // Endpoint do Webhook Finnhub (POST)
  app.post('/api/webhook/finnhub', (req: Request, res: Response) => {
    const secretHeader =
      req.headers['x-finnhub-secret'] ||
      (req.headers['X-Finnhub-Secret'] as string) ||
      (req.query.secret as string) ||
      req.body?.secret;
    const expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || 'dbfsnl9r01qiahublh4g';

    // 1. Validação de Segurança do Cabeçalho com o FINNHUB_WEBHOOK_SECRET
    const validation = validateWebhookHeader(secretHeader, expectedSecret);
    if (!validation.isValid) {
      console.warn('[DinhEuro Webhook] Tentativa não autorizada recebida no endpoint Finnhub.');
      return res.status(validation.statusCode).json(validation.response);
    }

    // 2. Confirmação imediata do recebimento (Status 200 OK)
    // Isso deve ser feito ANTES de qualquer lógica pesada para evitar timeouts na Finnhub.
    res.status(200).json({ received: true });

    // 3. Processamento posterior dos dados em segundo plano para sincronização de cotações
    const eventData = req.body;
    processarEventoEmBackground(eventData);
  });

  // Endpoint informativo do Webhook Finnhub (GET)
  app.get('/api/webhook/finnhub', (_req: Request, res: Response) => {
    res.json({
      status: 'active',
      message: 'Endpoint do Webhook Finnhub ativo e pronto para receber POST requests.',
      endpoint: '/api/webhook/finnhub',
      headerName: 'x-finnhub-secret',
      documentation: 'Configure este endpoint no painel de Webhooks da Finnhub com o segredo FINNHUB_WEBHOOK_SECRET.',
    });
  });

  // Endpoint para monitorar o status e histórico de webhooks recebidos
  app.get('/api/webhook/finnhub/status', (_req: Request, res: Response) => {
    res.json(getWebhookStatus());
  });

  // Real-time Aggregated Market Data API (Finnhub, AwesomeAPI, FMP, Coinbase, Yahoo Finance)
  app.get('/api/market/live', async (req: Request, res: Response) => {
    try {
      const customFinnhubKey = (req.query.finnhub_key as string) || (req.headers['x-finnhub-key'] as string);
      const data = await getAggregatedMarketData(customFinnhubKey);
      res.json(data);
    } catch (err) {
      console.error('[DinhEuro] Erro ao agregar dados de mercado:', err);
      res.status(500).json({ error: 'Erro ao obter dados de mercado em tempo real' });
    }
  });

  // Proxy endpoint for AwesomeAPI Economy to avoid browser CORS blocks
  app.get('/api/awesomeapi/last', async (_req: Request, res: Response) => {
    try {
      const awesomeUrl =
        process.env.VITE_AWESOME_ECONOMY_URL ||
        'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL,CAD-BRL,AUD-BRL,CHF-BRL,JPY-BRL,CNY-BRL';
      const response = await fetch(awesomeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DinhEuro/3.0',
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      return res.status(response.status).json({ error: 'AwesomeAPI upstream rate limit' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Mount Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[DinhEuro] Servidor rodando na porta ${PORT} (${isDev ? 'Desenvolvimento' : 'Produção'})`);
    console.log(`[DinhEuro] Endpoint do Webhook Finnhub pronto em: POST http://localhost:${PORT}/api/webhook/finnhub`);
  });
}

startServer().catch((err) => {
  console.error('[DinhEuro] Erro fatal ao iniciar o servidor:', err);
  process.exit(1);
});
