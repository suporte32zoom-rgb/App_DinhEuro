/**
 * Finnhub Webhook Handler for DinhEuro
 * Handles secret validation, immediate 200 acknowledgment, and background processing.
 */

export interface WebhookValidationResult {
  isValid: boolean;
  statusCode: number;
  response: { received?: boolean; error?: string };
}

export interface FinnhubWebhookEvent {
  type?: string;
  data?: any[];
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

  if (!headerValue || headerValue !== expectedSecret) {
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
 * Does not block HTTP response
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
  } catch (error) {
    console.error('[DinhEuro Webhook] Erro ao processar dados do webhook:', error);
  }
}
