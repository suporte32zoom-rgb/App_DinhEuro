import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWebhookHeader,
  processarEventoEmBackground,
  recentWebhookEvents,
} from './webhookHandler';

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
});

test('validateWebhookHeader accepts valid x-finnhub-secret with 200 OK', () => {
  const secret = 'dbfsnl9r01qiahublh4g';

  const validResult = validateWebhookHeader('dbfsnl9r01qiahublh4g', secret);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.statusCode, 200);
  assert.deepEqual(validResult.response, { received: true });
});

test('processarEventoEmBackground stores event in history without throwing', async () => {
  const mockPayload = {
    type: 'trade',
    data: [{ s: 'AAPL', p: 231.5, t: 1630000000, v: 100 }],
  };

  await processarEventoEmBackground(mockPayload);
  assert.ok(recentWebhookEvents.length > 0);
  assert.equal(recentWebhookEvents[0].event.type, 'trade');
});
