import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeterministicSeries } from './AdvancedChartsView';

test('buildDeterministicSeries generates consistent and reproducible historical bars for 5D, 1M, 6M, 1A', () => {
  const series1 = buildDeterministicSeries('PETR4', '1M', 52.71);
  const series2 = buildDeterministicSeries('PETR4', '1M', 52.71);

  assert.equal(series1.length, series2.length);
  assert.equal(series1.length, 31); // count=30 down to 0 = 31

  // Assert every single bar has exact matching values (zero jitter)
  for (let i = 0; i < series1.length; i++) {
    assert.equal(series1[i].open, series2[i].open, `Bar ${i} open mismatch`);
    assert.equal(series1[i].high, series2[i].high, `Bar ${i} high mismatch`);
    assert.equal(series1[i].low, series2[i].low, `Bar ${i} low mismatch`);
    assert.equal(series1[i].close, series2[i].close, `Bar ${i} close mismatch`);
    assert.equal(series1[i].volume, series2[i].volume, `Bar ${i} volume mismatch`);
  }
});

test('buildDeterministicSeries pins the last bar close to basePrice', () => {
  const targetPrice = 344.63;
  const series = buildDeterministicSeries('AAPL', '24h', targetPrice);
  const lastBar = series[series.length - 1];

  assert.equal(lastBar.close, targetPrice);
  assert.ok(lastBar.high >= targetPrice);
  assert.ok(lastBar.low <= targetPrice);
});

test('buildDeterministicSeries differentiates distinct timeframes correctly', () => {
  const series24h = buildDeterministicSeries('BTC/USD', '24h', 77800);
  const series1A = buildDeterministicSeries('BTC/USD', '1A', 77800);

  assert.notEqual(series24h.length, series1A.length);
  assert.equal(series24h.length, 25); // count=24 + 1
  assert.equal(series1A.length, 53);  // count=52 + 1
});
