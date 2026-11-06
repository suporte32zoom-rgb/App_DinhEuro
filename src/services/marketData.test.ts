import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_ASSETS, DEFAULT_UNIVERSAL_RATES } from './marketData';
import { getDualCurrencyDisplay } from '../utils/finance';

describe('Real-Time Market Data Engine & Catalog Expansion', () => {
  it('contains comprehensive catalog of 95+ assets across all market categories', () => {
    assert.ok(INITIAL_ASSETS.length >= 95, `Expected >= 95 assets, got ${INITIAL_ASSETS.length}`);

    const categories = new Set(INITIAL_ASSETS.map((a) => a.category));
    assert.ok(categories.has('indices'), 'Missing indices');
    assert.ok(categories.has('stocks_us'), 'Missing US stocks');
    assert.ok(categories.has('stocks_br'), 'Missing B3 Brazilian stocks');
    assert.ok(categories.has('forex'), 'Missing forex pairs');
    assert.ok(categories.has('crypto'), 'Missing crypto assets');
    assert.ok(categories.has('commodities'), 'Missing commodities');
  });

  it('guarantees every asset has valid positive price, non-empty sparkline and flag', () => {
    for (const asset of INITIAL_ASSETS) {
      assert.ok(asset.price > 0, `Asset ${asset.symbol} has non-positive price: ${asset.price}`);
      assert.ok(asset.currency && asset.currency.length >= 3, `Asset ${asset.symbol} missing currency`);
      assert.ok(Array.isArray(asset.sparkline) && asset.sparkline.length >= 4, `Asset ${asset.symbol} invalid sparkline`);
      assert.ok(asset.flag, `Asset ${asset.symbol} missing flag or category icon`);
    }
  });

  it('provides accurate dual currency display (Native & Converted BRL) for all assets', () => {
    // US Stock in USD -> displays USD and converted BRL
    const appleDual = getDualCurrencyDisplay(349.51, 'USD', DEFAULT_UNIVERSAL_RATES);
    assert.strictEqual(appleDual.primaryCurrency, 'USD');
    assert.strictEqual(appleDual.secondaryCurrency, 'BRL');
    assert.ok(appleDual.convertedBRL > 1800, `Expected BRL value > 1800, got ${appleDual.convertedBRL}`);

    // B3 Stock in BRL -> displays BRL and converted USD
    const petrDual = getDualCurrencyDisplay(47.20, 'BRL', DEFAULT_UNIVERSAL_RATES);
    assert.strictEqual(petrDual.primaryCurrency, 'BRL');
    assert.strictEqual(petrDual.secondaryCurrency, 'USD');
    assert.ok(petrDual.convertedUSD > 8 && petrDual.convertedUSD < 12, `Expected USD value ~8-12, got ${petrDual.convertedUSD}`);
  });

  it('contains balanced representation of market segments', () => {
    const counts = INITIAL_ASSETS.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    assert.ok(counts.indices >= 10, 'Expected at least 10 indices');
    assert.ok(counts.stocks_us >= 20, 'Expected at least 20 US stocks');
    assert.ok(counts.stocks_br >= 20, 'Expected at least 20 B3 stocks');
    assert.ok(counts.crypto >= 10, 'Expected at least 10 cryptos');
    assert.ok(counts.commodities >= 10, 'Expected at least 10 commodities');
    assert.ok(counts.forex >= 12, 'Expected at least 12 forex pairs');
  });

  it('provides tri-currency conversion including EUR and tertiaryFormatted', () => {
    const dual = getDualCurrencyDisplay(100, 'USD', DEFAULT_UNIVERSAL_RATES);
    assert.strictEqual(dual.primaryCurrency, 'USD');
    assert.strictEqual(dual.secondaryCurrency, 'BRL');
    assert.ok(dual.convertedEUR > 0, `Expected positive EUR converted value, got ${dual.convertedEUR}`);
    assert.ok(dual.tertiaryFormatted && dual.tertiaryFormatted.includes('€'), `Expected EUR tertiaryFormatted, got ${dual.tertiaryFormatted}`);
    assert.ok(dual.summaryTriCurrency.includes('R$') && dual.summaryTriCurrency.includes('€'));
  });

  it('guarantees unique realistic volumes across assets without artificial duplication', () => {
    const volCounts = new Map<string, number>();
    for (const a of INITIAL_ASSETS) {
      if (a.volume) {
        volCounts.set(a.volume, (volCounts.get(a.volume) || 0) + 1);
      }
    }
    // No single volume string should be blindly copied across more than 3 assets
    for (const [vol, count] of volCounts.entries()) {
      assert.ok(count <= 3, `Volume "${vol}" is duplicated across ${count} assets`);
    }
  });
});
