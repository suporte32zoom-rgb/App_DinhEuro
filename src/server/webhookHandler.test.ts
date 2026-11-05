import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWebhookHeader,
  processarEventoEmBackground,
  recentWebhookEvents,
  getWebhookStatus,
} from './webhookHandler';
import { getAggregatedMarketData, webhookQuoteOverrides } from './marketProxy';

test('validateWebhookHeader rejects missing or invalid x-finnhub-secret with 401 Unauthorized', () => {
  const secret = 'dbfsnl9r01qiahublh4g';

  // Missing header
  const missingResult = validateWebhookHeader(undefined, secret);
  assert.equal(missingResult.isValid, false);
  assert.equal(missingResult.statusCode, 401);
  assert.deepEqual(missingResult.response, { error: 'Unauthorized' });

  // Wrong secret
  const wrongResult = validateWebhookHeader('wrong-secret-token', secret);
  assert.equal(wrongResult.isValid, false);
  assert.equal(wrongResult.statusCode, 401);
  assert.deepEqual(wrongResult.response, { error: 'Unauthorized' });

  // Empty string
  const emptyResult = validateWebhookHeader('', secret);
  assert.equal(emptyResult.isValid, false);
  assert.equal(emptyResult.statusCode, 401);
});

test('validateWebhookHeader accepts valid x-finnhub-secret with 200 OK', () => {
  const secret = 'dbfsnl9r01qiahublh4g';

  const validResult = validateWebhookHeader('dbfsnl9r01qiahublh4g', secret);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.statusCode, 200);
  assert.deepEqual(validResult.response, { received: true });

  // Accepts trimmed header
  const trimmedResult = validateWebhookHeader(' dbfsnl9r01qiahublh4g ', secret);
  assert.equal(trimmedResult.isValid, true);
  assert.equal(trimmedResult.statusCode, 200);
});

test('processarEventoEmBackground stores event in history without throwing', async () => {
  const mockPayload = {
    type: 'trade',
    data: [{ s: 'AAPL', p: 352.80, t: Date.now(), v: 250 }],
  };

  await processarEventoEmBackground(mockPayload);
  assert.ok(recentWebhookEvents.length > 0);
  assert.equal(recentWebhookEvents[0].event.type, 'trade');
});

test('incoming trade events dynamically update real-time quotes in marketProxy', async () => {
  // Simulate live trade tick from Finnhub webhook
  const testPriceAAPL = 358.45;
  const mockAAPLTrade = {
    type: 'trade',
    data: [{ s: 'AAPL', p: testPriceAAPL, t: Date.now(), v: 1200 }],
  };

  await processarEventoEmBackground(mockAAPLTrade);

  // Verify override map has the tick
  assert.ok(webhookQuoteOverrides['AAPL']);
  assert.equal(webhookQuoteOverrides['AAPL'].price, testPriceAAPL);

  // Verify that market proxy serves this updated live quote
  const liveMarket = await getAggregatedMarketData();
  assert.ok(liveMarket.quotes['AAPL']);
  assert.equal(liveMarket.quotes['AAPL'].price, testPriceAAPL);
  assert.equal(liveMarket.quotes['AAPL'].source, 'finnhub_webhook_live');
});

test('crypto and forex symbols are normalized and synchronized from Finnhub webhook format', async () => {
  // Test Binance BTC pair from Finnhub: BINANCE:BTCUSDT
  const testBtcPrice = 82500.00;
  await processarEventoEmBackground({
    type: 'trade',
    data: [{ s: 'BINANCE:BTCUSDT', p: testBtcPrice, t: Date.now(), v: 1.5 }],
  });

  assert.ok(webhookQuoteOverrides['BTC/USD']);
  assert.equal(webhookQuoteOverrides['BTC/USD'].price, testBtcPrice);

  const marketData = await getAggregatedMarketData();
  assert.ok(marketData.quotes['BTC/USD']);
  assert.equal(marketData.quotes['BTC/USD'].price, testBtcPrice);
  assert.equal(marketData.rates.BTC, Number((1 / testBtcPrice).toFixed(8)));

  // Test Forex pair USDBRL
  const testUsdBrl = 5.4850;
  await processarEventoEmBackground({
    type: 'trade',
    data: [{ s: 'USDBRL', p: testUsdBrl, t: Date.now(), v: 50000 }],
  });

  assert.ok(webhookQuoteOverrides['USD/BRL']);
  assert.equal(webhookQuoteOverrides['USD/BRL'].price, testUsdBrl);
});

test('getWebhookStatus returns operational status and diagnostic metadata', () => {
  const status = getWebhookStatus();
  assert.equal(status.status, 'active');
  assert.equal(status.endpoint, '/api/webhook/finnhub');
  assert.equal(status.expectedHeader, 'x-finnhub-secret');
  assert.equal(status.secretConfigured, true);
  assert.ok(status.totalEventsReceived >= 0);
});
