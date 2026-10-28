import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  validateWebhookHeader,
  processarEventoEmBackground,
  recentWebhookEvents,
} from './src/server/webhookHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Middleware para interpretar JSON no corpo da requisição
  app.use(express.json());

  // Endpoint do Webhook Finnhub
  app.post('/api/webhook/finnhub', (req: Request, res: Response) => {
    const secretHeader = req.headers['x-finnhub-secret'];
    const expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || 'dbfsnl9r01qiahublh4g';

    // 1. Validação de Segurança do Cabeçalho
    const validation = validateWebhookHeader(secretHeader, expectedSecret);
    if (!validation.isValid) {
      console.warn('Tentativa de webhook não autorizada recebida.');
      return res.status(validation.statusCode).json(validation.response);
    }

    // 2. Confirmação imediata do recebimento (Status 200 OK)
    // Isso deve ser feito ANTES de qualquer lógica pesada para evitar timeouts na Finnhub.
    res.status(200).json({ received: true });

    // 3. Processamento posterior dos dados em segundo plano
    const eventData = req.body;
    processarEventoEmBackground(eventData);
  });

  // Endpoint para monitorar o status e histórico de webhooks recebidos
  app.get('/api/webhook/finnhub/status', (_req: Request, res: Response) => {
    res.json({
      status: 'active',
      webhookUrl: '/api/webhook/finnhub',
      totalEventsReceived: recentWebhookEvents.length,
      recentEvents: recentWebhookEvents.slice(0, 5),
    });
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[DinhEuro] Servidor rodando na porta ${PORT} (${isProduction ? 'Produção' : 'Desenvolvimento'})`);
    console.log(`[DinhEuro] Endpoint do Webhook Finnhub pronto em: POST http://localhost:${PORT}/api/webhook/finnhub`);
  });
}

startServer().catch((err) => {
  console.error('[DinhEuro] Erro fatal ao iniciar o servidor:', err);
  process.exit(1);
});
