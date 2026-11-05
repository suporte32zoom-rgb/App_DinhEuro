/**
 * Finnhub Webhook Handler for DinhEuro (dinheuro.com / dinheuro.com.br)
 * Handles secret validation, immediate 200 acknowledgment, and background processing.
 * Feeds live trades directly into market proxy cache for real-time quotation synchronization.
 */

import { updateQuoteFromWebhook, webhookQuoteOverrides } from './marketProxy';

export interface WebhookValidationResult {
  isValid: boolean;
  statusCode: number;
  response: { received?: boolean; error?: string };
}

export interface FinnhubWebhookEvent {
  type?: string;
  data?: Array<{
    s?: string; // Symbol (e.g. AAPL, BINANCE:BTCUSDT, PETR4)
    p?: number; // Price
    t?: number; // Timestamp
    v?: number; // Volume
  }>;
  [key: string]: any;
}

// In-memory buffer of recent webhook events received
export const recentWebhookEvents: {
  timestamp: string;
  event: FinnhubWebhookEvent;
}[] = [];

/**
 * Validates the security secret header from Finnhub webhook
 */
export function validateWebhookHeader(
  secretHeader: string | undefined | string[],
  expectedSecret: string = process.env.FINNHUB_WEBHOOK_SECRET || 'dbfsnl9r01qiahublh4g'
): WebhookValidationResult {
  const headerValue = Array.isArray(secretHeader) ? secretHeader[0] : secretHeader;

  if (!headerValue || headerValue.trim() !== expectedSecret.trim()) {
    return {
      isValid: false,
      statusCode: 401,
      response: { error: 'Unauthorized' },
    };
  }

  return {
    isValid: true,
    statusCode: 200,
    response: { received: true },
  };
}

/**
 * Background processor for Finnhub events
 * Does not block HTTP response and updates quotes in memory immediately
 */
export async function processarEventoEmBackground(data: FinnhubWebhookEvent): Promise<void> {
  try {
    console.log('[DinhEuro Webhook] Processando evento da Finnhub:', JSON.stringify(data));

    // Store in circular buffer (max 50 events)
    recentWebhookEvents.unshift({
      timestamp: new Date().toISOString(),
      event: data,
    });
    if (recentWebhookEvents.length > 50) {
      recentWebhookEvents.pop();
    }

    // Process trade ticks to update live quotes immediately
    if (data && data.type === 'trade' && Array.isArray(data.data)) {
      for (const trade of data.data) {
        if (trade && trade.s && typeof trade.p === 'number') {
          updateQuoteFromWebhook(trade.s, trade.p, trade.v, trade.t);
        }
      }
    }
  } catch (error) {
    console.error('[DinhEuro Webhook] Erro ao processar dados do webhook:', error);
  }
}

/**
 * Returns diagnostic metadata and health status for the Finnhub webhook integration
 */
export function getWebhookStatus() {
  const expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || 'dbfsnl9r01qiahublh4g';
  return {
    status: 'active',
    endpoint: '/api/webhook/finnhub',
    expectedHeader: 'x-finnhub-secret',
    secretConfigured: !!expectedSecret,
    totalEventsReceived: recentWebhookEvents.length,
    recentEvents: recentWebhookEvents.slice(0, 5),
    latestTicksApplied: Object.keys(webhookQuoteOverrides).length,
  };
}
