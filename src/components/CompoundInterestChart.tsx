import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Coins,
  Sparkles,
  Maximize2,
  X,
  Layers,
  BarChart3,
  LineChart as LineChartIcon,
  PiggyBank,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import { formatCurrencyValue, YearBreakdown } from '../utils/finance';

export interface CompoundChartProps {
  initialPrincipal: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
  breakdown: YearBreakdown[];
  finalBalance: number;
  totalInvested: number;
  totalInterest: number;
  onUpdateParams?: (params: {
    initialPrincipal?: number;
    monthlyContribution?: number;
    annualRate?: number;
    years?: number;
  }) => void;
}

// Fixed income benchmark calculation helper
function simulateFixedIncome(
  initial: number,
  monthly: number,
  ratePercent: number,
  years: number
): { final: number; breakdown: { year: number; balance: number }[] } {
  const monthlyRate = Math.pow(1 + ratePercent / 100, 1 / 12) - 1;
  const totalMonths = Math.max(1, Math.round(years * 12));
  let balance = initial;
  const breakdown: { year: number; balance: number }[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (m % 12 === 0 || m === totalMonths) {
      breakdown.push({
        year: Math.ceil(m / 12),
        balance: Math.round(balance),
      });
    }
  }
  return { final: Math.round(balance), breakdown };
}

export const CompoundInterestChart: React.FC<CompoundChartProps> = ({
  initialPrincipal,
  monthlyContribution,
  annualRate,
  years,
  breakdown,
  finalBalance,
  totalInvested,
  totalInterest,
  onUpdateParams,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [viewMode, setViewMode] = useState<'evolution' | 'benchmark' | 'contribution'>('evolution');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Formatted data for Main Evolution Chart (Aportes vs Juros)
  const evolutionData = [
    {
      year: 0,
      label: 'Início',
      totalInvested: Math.round(initialPrincipal),
      interestEarned: 0,
      totalBalance: Math.round(initialPrincipal),
      interestPercent: 0,
    },
    ...breakdown.map((row) => ({
      year: row.year,
      label: `Ano ${row.year}`,
      totalInvested: Math.round(row.totalInvested),
      interestEarned: Math.max(0, Math.round(row.interestEarned)),
      totalBalance: Math.round(row.totalBalance),
      interestPercent:
        row.totalBalance > 0
          ? Number(((row.interestEarned / row.totalBalance) * 100).toFixed(1))
          : 0,
    })),
  ];

  // Benchmark data comparing Fixed Income asset classes
  const poupancaSim = simulateFixedIncome(initialPrincipal, monthlyContribution, 6.17, years);
  const cdi100Sim = simulateFixedIncome(initialPrincipal, monthlyContribution, 11.5, years);
  const ipcaSim = simulateFixedIncome(initialPrincipal, monthlyContribution, 11.2, years);

  const benchmarkData = [
    {
      year: 0,
      label: 'Início',
      suaTaxa: Math.round(initialPrincipal),
      cdi100: Math.round(initialPrincipal),
      tesouroIpca: Math.round(initialPrincipal),
      poupanca: Math.round(initialPrincipal),
    },
    ...breakdown.map((row, idx) => ({
      year: row.year,
      label: `Ano ${row.year}`,
      suaTaxa: Math.round(row.totalBalance),
      cdi100: cdi100Sim.breakdown[idx]?.balance || Math.round(row.totalBalance),
      tesouroIpca: ipcaSim.breakdown[idx]?.balance || Math.round(row.totalBalance),
      poupanca: poupancaSim.breakdown[idx]?.balance || Math.round(row.totalInvested),
    })),
  ];

  // Contribution sensitivity comparison (0, 1x, 1.5x, 2x do aporte mensal)
  const doubleContribSim = simulateFixedIncome(initialPrincipal, monthlyContribution * 2, annualRate, years);
  const zeroContribSim = simulateFixedIncome(initialPrincipal, 0, annualRate, years);

  const contributionData = [
    {
      year: 0,
      label: 'Início',
      atual: Math.round(initialPrincipal),
      dobro: Math.round(initialPrincipal),
      semAporte: Math.round(initialPrincipal),
    },
    ...breakdown.map((row, idx) => ({
      year: row.year,
      label: `Ano ${row.year}`,
      atual: Math.round(row.totalBalance),
      dobro: doubleContribSim.breakdown[idx]?.balance || Math.round(row.totalBalance),
      semAporte: zeroContribSim.breakdown[idx]?.balance || Math.round(row.totalBalance),
    })),
  ];

  // Key metrics
  const multiplier = totalInvested > 0 ? (finalBalance / totalInvested).toFixed(2) : '1.00';
  const passiveMonthlyIncome = Math.round(finalBalance * 0.008); // 0.8% a.m. conservative safe withdrawal
  const interestPercentage = finalBalance > 0 ? ((totalInterest / finalBalance) * 100).toFixed(1) : '0';

  // Find tipping point year (when annual interest generated exceeds total invested that year)
  const annualContribution = monthlyContribution * 12;
  const tippingPoint = breakdown.find((b, idx) => {
    if (idx === 0) return b.interestEarned >= annualContribution;
    const prevInterest = breakdown[idx - 1].interestEarned;
    const yearInterest = b.interestEarned - prevInterest;
    return yearInterest >= annualContribution;
  });

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1322] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {years} anos de horizonte
            </span>
          </div>

          <div className="space-y-1.5 font-mono-numbers">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300 text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-bold text-white text-[11px]">
                  {formatCurrencyValue(entry.value, 'BRL', 0)}
                </span>
              </div>
            ))}
          </div>

          {viewMode === 'evolution' && (
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Impacto dos Juros:</span>
              <span className="font-bold text-emerald-400">
                {payload[1] && payload[0] && (payload[1].value + payload[0].value) > 0
                  ? `${(((payload[1]?.value || 0) / ((payload[0]?.value || 1) + (payload[1]?.value || 0))) * 100).toFixed(0)}% do saldo`
                  : '0%'}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = (height: number = 280) => {
    if (viewMode === 'benchmark') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={benchmarkData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line
              type="monotone"
              dataKey="suaTaxa"
              name={`Sua Simulação (${annualRate}% a.a.)`}
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="cdi100"
              name="CDI 100% (11.5% a.a.)"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="tesouroIpca"
              name="Tesouro IPCA+ (11.2% a.a.)"
              stroke="#A855F7"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="poupanca"
              name="Poupança (6.17% a.a.)"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (viewMode === 'contribution') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={contributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDobro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSemAporte" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Area
              type="monotone"
              dataKey="dobro"
              name={`Aporte em Dobro (${formatCurrencyValue(monthlyContribution * 2, 'BRL', 0)}/mês)`}
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDobro)"
            />
            <Area
              type="monotone"
              dataKey="atual"
              name={`Aporte Atual (${formatCurrencyValue(monthlyContribution, 'BRL', 0)}/mês)`}
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAtual)"
            />
            <Area
              type="monotone"
              dataKey="semAporte"
              name="Sem Aportes Mensais (Só Inicial)"
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorSemAporte)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Evolution of Capital (Invested vs Interest)
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Bar dataKey="totalInvested" name="Total Aportado" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="interestEarned" name="Juros Acumulados" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line
              type="monotone"
              dataKey="totalBalance"
              name="Patrimônio Total"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 3, fill: '#F59E0B' }}
            />
            <Line
              type="monotone"
              dataKey="interestEarned"
              name="Juros Compostos"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalInvested"
              name="Total Aportado"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default: Area Chart (Stacked Area)
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
          <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          <Area
            type="monotone"
            dataKey="totalInvested"
            name="Total Aportado (Seu Capital)"
            stackId="1"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInvested)"
          />
          <Area
            type="monotone"
            dataKey="interestEarned"
            name="Juros Compostos (Bola de Neve)"
            stackId="1"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInterest)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1221] p-3 rounded-2xl border border-slate-800">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setViewMode('evolution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              viewMode === 'evolution'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Evolução do Capital</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('benchmark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              viewMode === 'benchmark'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Comparador Renda Fixa</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('contribution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              viewMode === 'contribution'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Impacto do Aporte</span>
          </button>
        </div>

        {/* Chart Type Switches & Modal Trigger */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {viewMode === 'evolution' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-slate-400">
              <button
                type="button"
                onClick={() => setChartType('area')}
                title="Área Empilhada"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'area' ? 'bg-slate-800 text-emerald-400' : 'hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                title="Barras"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'bar' ? 'bg-slate-800 text-emerald-400' : 'hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                title="Linhas"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'line' ? 'bg-slate-800 text-emerald-400' : 'hover:text-white'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            title="Expandir Gráfico no Modal"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Expandir no Modal</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-[#070e1b] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {viewMode === 'evolution' && 'Evolução Patrimonial no Tempo (Recharts Engine)'}
              {viewMode === 'benchmark' && 'Simulação Comparativa: Sua Carteira vs Benchmarks'}
              {viewMode === 'contribution' && 'Curva de Sensibilidade por Intensidade de Aporte'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-numbers">
            {years} anos • {annualRate}% a.a.
          </span>
        </div>

        {renderChart(300)}
      </div>

      {/* Key Analytical Badges / Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#0c1a2e] to-[#070e1b] rounded-xl p-3.5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Multiplicador de Capital
            </span>
            <span className="text-xs font-black text-amber-400 font-mono-numbers">
              {multiplier}x
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Para cada R$ 1,00 aportado, seu patrimônio final terá{' '}
            <strong className="text-white font-mono-numbers">R$ {multiplier}</strong>.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0c1a2e] to-[#070e1b] rounded-xl p-3.5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              Renda Passiva Mensal
            </span>
            <span className="text-xs font-black text-emerald-400 font-mono-numbers">
              {formatCurrencyValue(passiveMonthlyIncome, 'BRL', 0)}/mês
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Retirada perpétua sustentável de 0,8% a.m. sem consumir o montante principal.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0c1a2e] to-[#070e1b] rounded-xl p-3.5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Ponto de Inflexão
            </span>
            <span className="text-xs font-black text-cyan-400">
              {tippingPoint ? `Ano ${tippingPoint.year}` : `Ano ${Math.min(years, 6)}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {tippingPoint
              ? `No Ano ${tippingPoint.year}, os juros anuais ultrapassam seus aportes anuais.`
              : 'O efeito bola de neve supera seus aportes com o tempo.'}
          </p>
        </div>
      </div>

      {/* Interactive Modal Dialog */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="bg-[#0c1527] border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080f1e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Simulação Interativa de Juros Compostos & Renda Fixa</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      DinhEuro Hub
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Projeção completa da evolução patrimonial, efeito bola de neve e comparação de rentabilidade.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Controls inside modal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070e1b] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Aporte Inicial:</label>
                  <div className="text-sm font-bold font-mono-numbers text-white">
                    {formatCurrencyValue(initialPrincipal, 'BRL')}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Aporte Mensal:</label>
                  <div className="text-sm font-bold font-mono-numbers text-blue-400">
                    {formatCurrencyValue(monthlyContribution, 'BRL')}/mês
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Taxa Anual:</label>
                  <div className="text-sm font-bold font-mono-numbers text-emerald-400">
                    {annualRate}% a.a.
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Horizonte:</label>
                  <div className="text-sm font-bold font-mono-numbers text-amber-400">
                    {years} Anos ({years * 12} meses)
                  </div>
                </div>
              </div>

              {/* View Selector inside modal */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('evolution')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'evolution'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Evolução do Capital
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('benchmark')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'benchmark'
                        ? 'bg-blue-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Comparador Renda Fixa
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('contribution')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'contribution'
                        ? 'bg-purple-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Sensibilidade de Aportes
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-mono-numbers">
                  Montante Final: <strong className="text-amber-400 text-sm">{formatCurrencyValue(finalBalance, 'BRL')}</strong>
                </div>
              </div>

              {/* Expanded Chart */}
              <div className="bg-[#070e1b] rounded-2xl p-4 sm:p-5 border border-slate-800">
                {renderChart(380)}
              </div>

              {/* Detailed Comparative Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Tabela Detalhada Ano a Ano
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono-numbers">
                    Juros representam {interestPercentage}% do patrimônio
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto no-scrollbar rounded-xl border border-slate-800 bg-[#070e1b]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-sm">
                      <tr>
                        <th className="py-2.5 px-3">Ano</th>
                        <th className="py-2.5 px-3 text-right">Total Investido</th>
                        <th className="py-2.5 px-3 text-right">Juros Acumulados</th>
                        <th className="py-2.5 px-3 text-right">Saldo Final</th>
                        <th className="py-2.5 px-3 text-right">% Juros</th>
                        <th className="py-2.5 px-3 text-right">Renda Passiva Est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono-numbers text-[11px]">
                      {breakdown.map((row) => {
                        const pct = row.totalBalance > 0 ? ((row.interestEarned / row.totalBalance) * 100).toFixed(0) : '0';
                        const estIncome = Math.round(row.totalBalance * 0.008);
                        const isTipping = tippingPoint && tippingPoint.year === row.year;

                        return (
                          <tr
                            key={row.year}
                            className={`hover:bg-slate-800/50 transition ${
                              isTipping ? 'bg-emerald-950/20 border-l-2 border-emerald-400' : ''
                            }`}
                          >
                            <td className="py-2 px-3 font-semibold text-white flex items-center gap-1.5">
                              <span>Ano {row.year}</span>
                              {isTipping && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                  Inflexão
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-300">
                              {formatCurrencyValue(row.totalInvested, 'BRL')}
                            </td>
                            <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                              +{formatCurrencyValue(row.interestEarned, 'BRL')}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-amber-300">
                              {formatCurrencyValue(row.totalBalance, 'BRL')}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">
                              {pct}%
                            </td>
                            <td className="py-2 px-3 text-right text-cyan-400 font-medium">
                              {formatCurrencyValue(estIncome, 'BRL', 0)}/mês
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#080f1e] flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-400" />
                Cálculo com juros compostos capitalizados mensalmente.
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
              >
                Fechar Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
