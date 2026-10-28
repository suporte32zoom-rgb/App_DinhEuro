import React, { useState } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  Percent,
  TrendingUp,
  Receipt,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import {
  convertCurrency,
  calculateCompoundInterest,
  calculateInflationImpact,
  calculateProfitAndTax,
  formatCurrencyValue,
} from '../utils/finance';

export const ToolsView: React.FC = () => {
  const { universalRates } = useMarket();
  const [activeTool, setActiveTool] = useState<'cambio' | 'juros' | 'inflacao' | 'darf'>('cambio');

  // --- 1. Câmbio Global State ---
  const [cambioAmount, setCambioAmount] = useState<number>(1000);
  const [cambioFrom, setCambioFrom] = useState<string>('EUR');
  const [cambioTo, setCambioTo] = useState<string>('BRL');
  const [spreadPercent, setSpreadPercent] = useState<number>(1.2); // 1.2% average commercial spread
  const [iofPercent, setIofPercent] = useState<number>(1.1); // 1.1% standard IOF

  const rawConverted = convertCurrency(cambioAmount, cambioFrom, cambioTo, universalRates);
  const spreadValue = (rawConverted * spreadPercent) / 100;
  const iofValue = (rawConverted * iofPercent) / 100;
  const netConverted = Math.max(0, rawConverted - spreadValue - iofValue);

  // --- 2. Juros Compostos State ---
  const [initialPrincipal, setInitialPrincipal] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualRate, setAnnualRate] = useState<number>(11.5); // 11.5% a.a. (CDI/Selic approx)
  const [years, setYears] = useState<number>(10);

  const compoundResult = calculateCompoundInterest({
    initialPrincipal,
    monthlyContribution,
    annualRatePercent: annualRate,
    years,
  });

  // --- 3. Inflação State ---
  const [inflationAmount, setInflationAmount] = useState<number>(50000);
  const [inflationRate, setInflationRate] = useState<number>(4.5); // 4.5% IPCA approx
  const [inflationYears, setInflationYears] = useState<number>(10);

  const inflationResult = calculateInflationImpact(inflationAmount, inflationRate, inflationYears);

  // --- 4. DARF & Imposto de Renda State ---
  const [darfBuyPrice, setDarfBuyPrice] = useState<number>(30.0);
  const [darfSellPrice, setDarfSellPrice] = useState<number>(42.0);
  const [darfQty, setDarfQty] = useState<number>(500);
  const [darfAssetType, setDarfAssetType] = useState<'stock_br' | 'stock_us' | 'crypto' | 'forex'>('stock_br');
  const [isDayTrade, setIsDayTrade] = useState<boolean>(false);
  const [monthlySalesVolume, setMonthlySalesVolume] = useState<number>(21000);

  const taxResult = calculateProfitAndTax({
    buyPrice: darfBuyPrice,
    sellPrice: darfSellPrice,
    quantity: darfQty,
    assetType: darfAssetType,
    isDayTrade,
    totalMonthlySalesValue: monthlySalesVolume,
  });

  const toolTabs = [
    { id: 'cambio', label: 'Simulador de Câmbio & Euro', icon: ArrowRightLeft },
    { id: 'juros', label: 'Juros Compostos & Renda Fixa', icon: TrendingUp },
    { id: 'inflacao', label: 'Poder de Compra & Inflação', icon: Percent },
    { id: 'darf', label: 'Calculadora de Lucro & Imposto (DARF)', icon: Receipt },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-400" />
          <span>Ferramentas & Simuladores Financeiros Globais</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cálculos precisos em tempo real para remessas de câmbio, planejamento de aposentadoria e tributação.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}
      >
        {toolTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
                activeTool === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TOOL 1: SIMULADOR DE CÂMBIO UNIVERSAL --- */}
      {activeTool === 'cambio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0d1627] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Simulador de Remessa & Conversor Global</h2>
              <p className="text-xs text-slate-400 mt-1">
                Taxas interbancárias sincronizadas com o Banco Central Europeu e Finnhub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
                <label className="text-xs text-slate-400 font-medium">Você envia:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={cambioAmount}
                    onChange={(e) => setCambioAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base font-bold font-mono-numbers text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={cambioFrom}
                    onChange={(e) => setCambioFrom(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="BRL">BRL (R$)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              {/* To */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
                <label className="text-xs text-slate-400 font-medium">Você recebe (Comercial Puro):</label>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-base font-bold font-mono-numbers text-emerald-400">
                    {formatCurrencyValue(rawConverted, cambioTo, 2)}
                  </div>
                  <select
                    value={cambioTo}
                    onChange={(e) => setCambioTo(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Spreads & Fees Configuration */}
            <div className="bg-[#070e1b] rounded-xl p-4 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulação de Custos Reais de Remessa Internacional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Spread da Corretora / Banco (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={spreadPercent}
                    onChange={(e) => setSpreadPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono-numbers text-white"
                  />
                  <span className="text-[10px] text-slate-500">Média em fintechs: 1.0% a 1.5%</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">IOF Cambial (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iofPercent}
                    onChange={(e) => setIofPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono-numbers text-white"
                  />
                  <span className="text-[10px] text-slate-500">1.1% (mesma titularidade) ou 0.38%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Câmbio Comercial de Referência:</span>
                  <span className="font-mono text-slate-200">
                    1 {cambioFrom} = {(universalRates[cambioTo] / universalRates[cambioFrom]).toFixed(4)} {cambioTo}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Custo do Spread ({spreadPercent}%):</span>
                  <span className="font-mono text-rose-400">-{formatCurrencyValue(spreadValue, cambioTo)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IOF ({iofPercent}%):</span>
                  <span className="font-mono text-rose-400">-{formatCurrencyValue(iofValue, cambioTo)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Efetivo a Receber:</span>
                  <span className="font-mono text-emerald-400">{formatCurrencyValue(netConverted, cambioTo)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dicas de Economia Cambial</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Evite o câmbio turismo:</strong> O câmbio comercial cotado no DinhEuro é o oficial interbancário. Corretoras globais como Interactive Brokers ou Avenue cobram spreads a partir de 0,2% a 1,5%, muito inferiores aos 4% a 6% de casas de câmbio físicas.
              </p>
              <p>
                <strong>2. Planejamento em Euro (€):</strong> Se você planeja viagens, residência ou cidadania europeia, aportes periódicos reduzem o risco de volatilidade cambial da paridade EUR/BRL.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TOOL 2: JUROS COMPOSTOS --- */}
      {activeTool === 'juros' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0d1627] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Calculadora de Juros Compostos</h2>
              <p className="text-xs text-slate-400 mt-1">
                Projeção de crescimento patrimonial com aportes mensais recorrentes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Aporte Inicial (R$):</label>
                <input
                  type="number"
                  value={initialPrincipal}
                  onChange={(e) => setInitialPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Aporte Mensal (R$):</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Taxa de Juros Anual (% a.a.):</label>
                <input
                  type="number"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Prazo em Anos:</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Total Investido</span>
                <p className="text-base font-bold font-mono-numbers text-white mt-1">
                  {formatCurrencyValue(compoundResult.totalInvested, 'BRL')}
                </p>
              </div>

              <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Total em Juros Ganhos</span>
                <p className="text-base font-bold font-mono-numbers text-emerald-400 mt-1">
                  +{formatCurrencyValue(compoundResult.totalInterest, 'BRL')}
                </p>
              </div>

              <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Montante Final</span>
                <p className="text-base font-black font-mono-numbers text-amber-400 mt-1">
                  {formatCurrencyValue(compoundResult.finalBalance, 'BRL')}
                </p>
              </div>
            </div>

            {/* Annual Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Evolução Anual
              </h3>
              <div className="max-h-48 overflow-y-auto no-scrollbar rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#070e1b] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Ano</th>
                      <th className="py-2 px-3 text-right">Total Aportado</th>
                      <th className="py-2 px-3 text-right">Juros Acumulados</th>
                      <th className="py-2 px-3 text-right">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                    {compoundResult.breakdown.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-white">Ano {row.year}</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          {formatCurrencyValue(row.totalInvested, 'BRL')}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400">
                          +{formatCurrencyValue(row.interestEarned, 'BRL')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-300">
                          {formatCurrencyValue(row.totalBalance, 'BRL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">O Poder dos Juros Compostos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No exemplo acima, os juros acumulados representam{' '}
              <strong className="text-emerald-400 font-mono">
                {((compoundResult.totalInterest / compoundResult.finalBalance) * 100).toFixed(1)}%
              </strong>{' '}
              de todo o patrimônio final conquistado. O tempo e a disciplina de aportes regulares são os maiores multiplicadores de capital.
            </p>
          </div>
        </div>
      )}

      {/* --- TOOL 3: INFLAÇÃO & PODER DE COMPRA --- */}
      {activeTool === 'inflacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0d1627] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Simulador de Perda de Poder de Compra</h2>
              <p className="text-xs text-slate-400 mt-1">
                Veja o impacto da inflação (IPCA/CPI) sobre o seu patrimônio ao longo do tempo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Valor Atual:</label>
                <input
                  type="number"
                  value={inflationAmount}
                  onChange={(e) => setInflationAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inflação Anual Média (% a.a.):</label>
                <input
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Período (Anos):</label>
                <input
                  type="number"
                  value={inflationYears}
                  onChange={(e) => setInflationYears(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>
            </div>

            {/* Impact Box */}
            <div className="bg-[#070e1b] rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Poder de compra equivalente futuro:</span>
                <span className="text-xl font-bold font-mono-numbers text-rose-400">
                  {formatCurrencyValue(inflationResult.futurePurchasingPower, 'BRL')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Perda real de valor:</span>
                <span className="text-sm font-bold font-mono-numbers text-rose-400">
                  -{inflationResult.lossPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-300 font-semibold">
                  Valor necessário no futuro para comprar o mesmo que hoje:
                </span>
                <span className="text-lg font-bold font-mono-numbers text-amber-400">
                  {formatCurrencyValue(inflationResult.equivalentNeeded, 'BRL')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Proteção Anti-Inflação</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deixar dinheiro parado na poupança ou em moeda fiduciária corrói seu patrimônio silenciosamente. O DinhEuro recomenda diversificar em ativos reais (Ações globais, Títulos IPCA+, Ouro e Euro).
            </p>
          </div>
        </div>
      )}

      {/* --- TOOL 4: DARF & TRIBUTAÇÃO --- */}
      {activeTool === 'darf' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0d1627] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Calculadora de Ganho de Capital & DARF</h2>
              <p className="text-xs text-slate-400 mt-1">
                Conformidade com a legislação da Receita Federal para ações e criptoativos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Ativo:</label>
                <select
                  value={darfAssetType}
                  onChange={(e) => setDarfAssetType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="stock_br">Ações Brasil (B3)</option>
                  <option value="stock_us">Ações EUA / Global</option>
                  <option value="crypto">Criptomoeda</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preço de Compra:</label>
                <input
                  type="number"
                  step="any"
                  value={darfBuyPrice}
                  onChange={(e) => setDarfBuyPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preço de Venda:</label>
                <input
                  type="number"
                  step="any"
                  value={darfSellPrice}
                  onChange={(e) => setDarfSellPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantidade de Ações / Cotas:</label>
                <input
                  type="number"
                  value={darfQty}
                  onChange={(e) => setDarfQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Volume Total Vendido no Mês (R$):</label>
                <input
                  type="number"
                  value={monthlySalesVolume}
                  onChange={(e) => setMonthlySalesVolume(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={isDayTrade}
                    onChange={(e) => setIsDayTrade(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                  <span>Operação Day Trade (20%)</span>
                </label>
              </div>
            </div>

            {/* Results */}
            <div className="bg-[#070e1b] rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Lucro Bruto Apurado:</span>
                <span className="text-base font-bold font-mono-numbers text-white">
                  R$ {taxResult.grossProfit.toFixed(2)} ({taxResult.returnPercentage.toFixed(2)}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status de Isenção Fiscal:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-xs ${
                    taxResult.isTaxExempt
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : 'text-amber-400 bg-amber-500/15'
                  }`}
                >
                  {taxResult.isTaxExempt ? '✓ ISENTO de Imposto de Renda' : 'TRIBUTÁVEL'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Alíquota Aplicável:</span>
                <span className="font-mono text-slate-200">{taxResult.taxRatePercent}%</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">DARF Estimado a Pagar:</span>
                <span className="text-base font-bold font-mono-numbers text-rose-400">
                  R$ {taxResult.estimatedTaxDue.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Lucro Líquido Final no Bolso:</span>
                <span className="text-lg font-black font-mono-numbers text-emerald-400">
                  R$ {taxResult.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Regras da Receita Federal</h3>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>• <strong>Ações B3 (Swing Trade):</strong> Isento para vendas totais de até R$ 20.000 no mês. Acima disso, tributação de 15% sobre o ganho.</li>
              <li>• <strong>Day Trade:</strong> Tributação fixa de 20%, sem qualquer faixa de isenção.</li>
              <li>• <strong>Criptoativos:</strong> Isenção para alienações totais de até R$ 35.000 mensais.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
