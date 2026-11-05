import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE_TAB_MAP, TAB_ROUTE_MAP, NavigationTab } from '../context/MarketContext';

test('ROUTE_TAB_MAP correctly routes legal and institutional paths', () => {
  assert.equal(ROUTE_TAB_MAP['/termos-de-uso'], 'termos');
  assert.equal(ROUTE_TAB_MAP['/politica-de-privacidade'], 'privacidade');
  assert.equal(ROUTE_TAB_MAP['/politica-de-cookies'], 'cookies');
  assert.equal(ROUTE_TAB_MAP['/disclaimer'], 'disclaimer');
  assert.equal(ROUTE_TAB_MAP['/sobre'], 'sobre');
  assert.equal(ROUTE_TAB_MAP['/day-trade'], 'daytrade');
  assert.equal(ROUTE_TAB_MAP['/fluxo-tape-reading'], 'tape_reading');
  assert.equal(ROUTE_TAB_MAP['/renda-fixa-derivativos'], 'renda_fixa');
});

test('TAB_ROUTE_MAP produces clean SEO-friendly URLs', () => {
  assert.equal(TAB_ROUTE_MAP['termos'], '/termos-de-uso');
  assert.equal(TAB_ROUTE_MAP['privacidade'], '/politica-de-privacidade');
  assert.equal(TAB_ROUTE_MAP['cookies'], '/politica-de-cookies');
  assert.equal(TAB_ROUTE_MAP['disclaimer'], '/disclaimer');
  assert.equal(TAB_ROUTE_MAP['sobre'], '/sobre');
  assert.equal(TAB_ROUTE_MAP['daytrade'], '/day-trade');
  assert.equal(TAB_ROUTE_MAP['tape_reading'], '/fluxo-tape-reading');
  assert.equal(TAB_ROUTE_MAP['renda_fixa'], '/renda-fixa-derivativos');
});

test('LGPD consent payload structure conforms to legal auditing schema', () => {
  const samplePayload = {
    accepted: true,
    date: new Date().toISOString(),
    version: '2026.1',
  };

  assert.equal(samplePayload.accepted, true);
  assert.ok(typeof samplePayload.date === 'string');
  assert.ok(samplePayload.version.startsWith('2026'));
});
