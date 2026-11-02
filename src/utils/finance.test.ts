import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  calculateCompoundInterest,
  calculateInflationImpact,
  calculateProfitAndTax,
  getDualCurrencyDisplay,
  CurrencyRates
} from './finance';

test('convertCurrency performs accurate cross-currency conversions', () => {
  // Rates relative to 1 USD: USD = 1.0, BRL = 5.5, EUR = 0.92, GBP = 0.78
  const rates: CurrencyRates = {
    USD: 1.0,
    BRL: 5.5,
    EUR: 0.92,
    GBP: 0.78,
  };

  // Convert 100 USD to BRL -> 100 / 1.0 * 5.5 = 550
  assert.equal(convertCurrency(100, 'USD', 'BRL', rates), 550);

  // Convert 550 BRL to USD -> 550 / 5.5 * 1.0 = 100
  assert.equal(convertCurrency(550, 'BRL', 'USD', rates), 100);

  // Convert 100 EUR to BRL -> 100 / 0.92 * 5.5 = 597.8261
  const eurToBrl = convertCurrency(100, 'EUR', 'BRL', rates);
  assert.equal(eurToBrl, 597.8261);

  // Identity conversion
  assert.equal(convertCurrency(250, 'EUR', 'EUR', rates), 250);
});

test('calculateCompoundInterest computes accurate future value and breakdowns', () => {
  const result = calculateCompoundInterest({
    initialPrincipal: 1000,
    monthlyContribution: 200,
    annualRatePercent: 12,
    years: 1,
  });

  // Total invested = 1000 + 200*12 = 3400
  assert.equal(result.totalInvested, 3400);
  // Final balance must be greater than total invested due to 12% interest
  assert.ok(result.finalBalance > 3400);
  assert.ok(result.totalInterest > 0);
  assert.equal(result.breakdown.length, 1);
});

test('calculateInflationImpact projects real purchasing power erosion', () => {
  const result = calculateInflationImpact(10000, 5, 10);
  // In 10 years at 5% annual inflation, purchasing power diminishes significantly
  assert.ok(result.futurePurchasingPower < 10000);
  assert.ok(result.lossPercentage > 30);
  assert.ok(result.equivalentNeeded > 15000);
});

test('calculateProfitAndTax respects Brazilian stock exemption threshold', () => {
  // Sale of R$ 15,000 (below R$ 20,000 exemption limit)
  const exemptResult = calculateProfitAndTax({
    buyPrice: 10,
    sellPrice: 15,
    quantity: 1000, // Cost: 10,000, Sale: 15,000, Profit: 5,000
    assetType: 'stock_br',
    isDayTrade: false,
    totalMonthlySalesValue: 15000,
  });

  assert.equal(exemptResult.grossProfit, 5000);
  assert.equal(exemptResult.isTaxExempt, true);
  assert.equal(exemptResult.estimatedTaxDue, 0);
  assert.equal(exemptResult.netProfit, 5000);

  // Day trade is NOT exempt
  const dayTradeResult = calculateProfitAndTax({
    buyPrice: 10,
    sellPrice: 15,
    quantity: 1000,
    assetType: 'stock_br',
    isDayTrade: true,
    totalMonthlySalesValue: 15000,
  });

  assert.equal(dayTradeResult.isTaxExempt, false);
  assert.equal(dayTradeResult.taxRatePercent, 20);
  assert.equal(dayTradeResult.estimatedTaxDue, 1000); // 20% of 5,000
  assert.equal(dayTradeResult.netProfit, 4000);
});

test('getDualCurrencyDisplay formats USD assets with BRL converted values', () => {
  const rates: CurrencyRates = { USD: 1.0, BRL: 5.50 };

  // For Apple stock at 200 USD: primary is USD, secondary is BRL (200 * 5.5 = 1100 BRL)
  const dualUsd = getDualCurrencyDisplay(200, 'USD', rates);
  assert.equal(dualUsd.primaryCurrency, 'USD');
  assert.equal(dualUsd.secondaryCurrency, 'BRL');
  assert.equal(dualUsd.convertedBRL, 1100);
  assert.ok(dualUsd.primaryFormatted.includes('200'));
  assert.ok(dualUsd.secondaryFormatted.includes('1.100') || dualUsd.secondaryFormatted.includes('1100'));

  // For Petrobras at 35 BRL: primary is BRL, secondary is USD (35 / 5.5 = 6.36 USD)
  const dualBrl = getDualCurrencyDisplay(35, 'BRL', rates);
  assert.equal(dualBrl.primaryCurrency, 'BRL');
  assert.equal(dualBrl.secondaryCurrency, 'USD');
  assert.equal(Number(dualBrl.convertedUSD.toFixed(2)), 6.36);
  assert.ok(dualBrl.primaryFormatted.includes('35'));
  assert.ok(dualBrl.secondaryFormatted.includes('6.36') || dualBrl.secondaryFormatted.includes('6,36'));
});

