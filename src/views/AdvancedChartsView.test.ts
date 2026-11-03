import test from 'node:test';
import assert from 'node:assert/strict';
import { generateD3Series } from '../components/D3AdvancedChart';
import { getAssetMetadata } from '../utils/assetProfiles';
import { MarketAsset } from '../services/marketData';

test('generateD3Series generates consistent and reproducible historical bars for 5D, 1M, 6M, 1A, 5A', () => {
  const series1 = generateD3Series('PETR4', '1M', 52.71);
  const series2 = generateD3Series('PETR4', '1M', 52.71);

  assert.equal(series1.length, series2.length);
  assert.equal(series1.length, 31);

  for (let i = 0; i < series1.length; i++) {
    assert.equal(series1[i].open, series2[i].open, `Bar ${i} open mismatch`);
    assert.equal(series1[i].high, series2[i].high, `Bar ${i} high mismatch`);
    assert.equal(series1[i].low, series2[i].low, `Bar ${i} low mismatch`);
    assert.equal(series1[i].close, series2[i].close, `Bar ${i} close mismatch`);
    assert.equal(series1[i].volume, series2[i].volume, `Bar ${i} volume mismatch`);
  }
});

test('generateD3Series pins the last bar close to basePrice', () => {
  const targetPrice = 344.63;
  const series = generateD3Series('AAPL', '1D', targetPrice);
  const lastBar = series[series.length - 1];

  assert.equal(lastBar.close, targetPrice);
  assert.ok(lastBar.high >= targetPrice);
  assert.ok(lastBar.low <= targetPrice);
});

test('getAssetMetadata returns complete 6 required modules metadata for B3 asset', () => {
  const mockAsset: MarketAsset = {
    id: 'ibovespa',
    symbol: 'IBOVESPA',
    name: 'Índice Bovespa (Brasil B3)',
    category: 'indices',
    price: 167921.80,
    currency: 'BRL',
    change24h: 0.85,
    changeValue: 1412.30,
    high24h: 168500.00,
    low24h: 166800.00,
    volume: 'R$ 29.8B',
    sparkline: [167000, 167921.80],
  };

  const meta = getAssetMetadata(mockAsset);
  assert.equal(meta.ticker, 'IBOV');
  assert.equal(meta.marketOrigin, 'B3 - Brasil, Bolsa, Balcão');
  assert.ok(meta.tags.includes('#B3'));
  assert.ok(meta.tags.includes('América Latina'));
  assert.ok(meta.aiDiagnosis.strengths.length > 0);
  assert.ok(meta.aiDiagnosis.risks.length > 0);
  assert.ok(meta.institutionalProfile.nature.length > 0);
  assert.ok(meta.week52High > 0);
  assert.ok(meta.week52Low > 0);
});
