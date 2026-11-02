import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Sliders,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CandlePoint } from '../services/marketData';
import { getDualCurrencyDisplay } from '../utils/finance';

export type ChartTimeframe = '24h' | '1D' | '5D' | '1M' | '6M' | '1A';

// Deterministic 32-bit PRNG (Mulberry32) for solid, stable historical series
function createSeededPRNG(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a 100% deterministic, jitter-free baseline series for any asset and timeframe.
 * Guarantees that historical series (5D, 1M, 6M, 1A) remain completely static.
 */
export function buildDeterministicSeries(
  symbol: string,
  timeframe: ChartTimeframe,
  basePrice: number
): CandlePoint[] {
  const prng = createSeededPRNG(`${symbol}_${timeframe}_dinheuro_v2`);
  let count = 24;
  let intervalMinutes = 60;

  if (timeframe === '24h') {
    count = 24;
    intervalMinutes = 60;
  } else if (timeframe === '1D') {
    count = 28;
    intervalMinutes = 15;
  } else if (timeframe === '5D') {
    count = 30;
    intervalMinutes = 240;
  } else if (timeframe === '1M') {
    count = 30;
    intervalMinutes = 1440;
  } else if (timeframe === '6M') {
    count = 26;
    intervalMinutes = 1440 * 7;
  } else if (timeframe === '1A') {
    count = 52;
    intervalMinutes = 1440 * 7;
  }

  const candles: CandlePoint[] = [];
  let price = basePrice * 0.94;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timeStamp = new Date(now - i * intervalMinutes * 60 * 1000);
    const variance = (prng() - 0.48) * (price * 0.016);
    const open = price;
    const close = Math.max(0.01, open + variance);
    const high = Math.max(open, close) + prng() * (price * 0.007);
    const low = Math.min(open, close) - prng() * (price * 0.007);
    const volume = Math.floor(prng() * 50000 + 10000);

    const timeStr =
      timeframe === '24h' || timeframe === '1D'
        ? timeStamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : timeStamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    candles.push({
      time: timeStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  // Pin the final close to the current base price
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = Number(basePrice.toFixed(2));
    last.high = Math.max(last.high, last.close);
    last.low = Math.min(last.low, last.close);
  }

  return candles;
}

export const AdvancedChartsView: React.FC = () => {
  const { assets, universalRates } = useMarket();

  const [selectedSymbol, setSelectedSymbol] = useState<string>('EUR/BRL');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1D');
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Active asset
  const currentAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  const isPositive = currentAsset.change24h >= 0;

  // Determines whether the active timeframe is Intraday/Real-time or Historical Static
  const isRealtime = timeframe === '24h' || timeframe === '1D';

  // In-memory series cache to prevent duplicate instances or memory re-allocations
  const seriesCacheRef = useRef<Map<string, CandlePoint[]>>(new Map());

  // Throttling references
  const lastThrottleTimeRef = useRef<number>(0);
  const pendingThrottleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const THROTTLE_INTERVAL_MS = 3500; // 3.5 seconds throttle limit

  // State: Throttled, stable candle points
  const [candles, setCandles] = useState<CandlePoint[]>(() =>
    buildDeterministicSeries(selectedSymbol, timeframe, currentAsset.price)
  );

  // 1. Synchronize series whenever asset symbol or timeframe changes
  useEffect(() => {
    // Clear any pending throttle timers to prevent memory leaks or crossed updates
    if (pendingThrottleTimeoutRef.current) {
      clearTimeout(pendingThrottleTimeoutRef.current);
      pendingThrottleTimeoutRef.current = null;
    }

    const cacheKey = `${selectedSymbol}_${timeframe}`;
    let cached = seriesCacheRef.current.get(cacheKey);

    if (!cached) {
      cached = buildDeterministicSeries(selectedSymbol, timeframe, currentAsset.price);
      seriesCacheRef.current.set(cacheKey, cached);
    }

    // Set cloned data to ensure clean reactive render
    setCandles(cached.map((c) => ({ ...c })));
    lastThrottleTimeRef.current = Date.now();
  }, [selectedSymbol, timeframe]);

  // 2. Controlled Throttling for Real-Time Updates (24h / 1D only)
  // Historical timeframes (5D, 1M, 6M, 1A) remain 100% STATIC.
  useEffect(() => {
    if (!isRealtime) return;

    const now = Date.now();
    const elapsed = now - lastThrottleTimeRef.current;

    const applyThrottledPrice = (newPrice: number) => {
      setCandles((prev) => {
        if (!prev || prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];
        if (last.close === newPrice) return prev;

        const updatedLast: CandlePoint = {
          ...last,
          close: Number(newPrice.toFixed(2)),
          high: Number(Math.max(last.high, newPrice).toFixed(2)),
          low: Number(Math.min(last.low, newPrice).toFixed(2)),
        };

        const next = [...prev];
        next[lastIdx] = updatedLast;
        return next;
      });
      lastThrottleTimeRef.current = Date.now();
    };

    if (elapsed >= THROTTLE_INTERVAL_MS) {
      applyThrottledPrice(currentAsset.price);
    } else {
      if (!pendingThrottleTimeoutRef.current) {
        pendingThrottleTimeoutRef.current = setTimeout(() => {
          pendingThrottleTimeoutRef.current = null;
          applyThrottledPrice(currentAsset.price);
        }, THROTTLE_INTERVAL_MS - elapsed);
      }
    }

    return () => {
      if (pendingThrottleTimeoutRef.current) {
        clearTimeout(pendingThrottleTimeoutRef.current);
        pendingThrottleTimeoutRef.current = null;
      }
    };
  }, [currentAsset.price, isRealtime]);

  // 3. Smooth Intraday Pulse (every 4s) exclusively for 24h / 1D (zero jitter, single active bar only)
  useEffect(() => {
    if (!isRealtime) return;

    const interval = setInterval(() => {
      setCandles((prev) => {
        if (!prev || prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];
        // Micro-oscillation of +/- 0.05% strictly on the active bar
        const microDelta = (Math.random() - 0.49) * (last.close * 0.0006);
        const newClose = Number((last.close + microDelta).toFixed(2));

        const updatedLast: CandlePoint = {
          ...last,
          close: newClose,
          high: Number(Math.max(last.high, newClose).toFixed(2)),
          low: Number(Math.min(last.low, newClose).toFixed(2)),
        };

        const next = [...prev];
        next[lastIdx] = updatedLast;
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isRealtime, selectedSymbol, timeframe]);

  // Calculate Simple Moving Averages memoized to avoid redundant recalculations
  const sma20 = useMemo(() => {
    return candles.map((c, idx, arr) => {
      if (idx < 4) return null;
      const slice = arr.slice(idx - 4, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / 5;
    });
  }, [candles]);

  const sma50 = useMemo(() => {
    return candles.map((c, idx, arr) => {
      if (idx < 9) return null;
      const slice = arr.slice(idx - 9, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / 10;
    });
  }, [candles]);

  // Sizing for responsive SVG canvas
  const svgWidth = 840;
  const svgHeight = 360;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2 - (showVolume ? 60 : 0);

  const minVal = useMemo(() => Math.min(...candles.map((c) => c.low)), [candles]);
  const maxVal = useMemo(() => Math.max(...candles.map((c) => c.high)), [candles]);
  const range = maxVal - minVal || 1;
  const maxVol = useMemo(() => Math.max(...candles.map((c) => c.volume)) || 1, [candles]);

  const getY = (val: number) => {
    return paddingY + chartH - ((val - minVal) / range) * chartH;
  };

  const getX = (idx: number) => {
    return paddingX + (idx / Math.max(1, candles.length - 1)) * chartW;
  };

  const linePath = useMemo(() => {
    return candles.reduce((acc, c, idx) => {
      const x = getX(idx);
      const y = getY(c.close);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  }, [candles, minVal, maxVal, range]);

  const sma20Path = useMemo(() => {
    return sma20.reduce((acc, val, idx) => {
      if (val === null) return acc;
      const x = getX(idx);
      const y = getY(val);
      return `${acc} ${acc === '' ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  }, [sma20, minVal, maxVal, range]);

  const sma50Path = useMemo(() => {
    return sma50.reduce((acc, val, idx) => {
      if (val === null) return acc;
      const x = getX(idx);
      const y = getY(val);
      return `${acc} ${acc === '' ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  }, [sma50, minVal, maxVal, range]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header and Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-400" />
            <span>Terminal Gráfico Avançado & Análise Técnica</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualização institucional de velas japonesas, médias móveis (SMA) e indicadores técnicos sem jitter.
          </p>
        </div>

        {/* Asset Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Ativo:</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.symbol}>
                {a.symbol} - {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Terminal Container */}
      <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Terminal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentAsset.flag || '📊'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{currentAsset.symbol}</span>
                <span className="text-xs text-slate-400 font-medium">{currentAsset.name}</span>
                {isRealtime ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Tempo Real (Throttled 3.5s)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    Histórico Estático
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-baseline gap-2.5 text-xs font-mono-numbers mt-0.5">
                <span className="text-xl font-bold text-white">
                  {getDualCurrencyDisplay(currentAsset.price, currentAsset.currency, universalRates).primaryFormatted}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ≈ {getDualCurrencyDisplay(currentAsset.price, currentAsset.currency, universalRates).secondaryFormatted}
                </span>
                <span
                  className={`font-semibold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {currentAsset.change24h.toFixed(2)}% ({isPositive ? '+' : ''}
                  {currentAsset.changeValue.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe & Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe buttons: 24h, 1D, 5D, 1M, 6M, 1A */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              {(['24h', '1D', '5D', '1M', '6M', '1A'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg transition text-xs font-semibold cursor-pointer ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Candle / Line toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setChartMode('candle')}
                className={`px-3 py-1.5 rounded-lg transition text-xs font-semibold cursor-pointer ${
                  chartMode === 'candle' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Velas
              </button>
              <button
                onClick={() => setChartMode('line')}
                className={`px-3 py-1.5 rounded-lg transition text-xs font-semibold cursor-pointer ${
                  chartMode === 'line' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Linha
              </button>
            </div>
          </div>
        </div>

        {/* Technical Indicators Toggle Bar */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Indicadores:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-medium">
            <input
              type="checkbox"
              checked={showSMA20}
              onChange={(e) => setShowSMA20(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>SMA 20 (Curta)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-sky-400 font-medium">
            <input
              type="checkbox"
              checked={showSMA50}
              onChange={(e) => setShowSMA50(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>SMA 50 (Média)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-slate-400 focus:ring-0"
            />
            <span>Volume</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-purple-400 font-medium">
            <input
              type="checkbox"
              checked={showRSI}
              onChange={(e) => setShowRSI(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-400 focus:ring-0"
            />
            <span>RSI (14)</span>
          </label>
        </div>

        {/* Interactive Main SVG Canvas */}
        <div className="relative bg-[#070d18] rounded-2xl border border-slate-800/90 p-2 sm:p-4 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-72 sm:h-96 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Guide Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingY + pct * chartH;
              const priceLevel = maxVal - pct * range;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#162235"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={svgWidth - paddingX + 6}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {priceLevel.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Render Candlesticks or Line */}
            {chartMode === 'line' ? (
              <path
                d={linePath}
                fill="none"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-out"
              />
            ) : (
              candles.map((c, i) => {
                const x = getX(i);
                const isUp = c.close >= c.open;
                const bodyTop = getY(Math.max(c.open, c.close));
                const bodyBottom = getY(Math.min(c.open, c.close));
                const bodyHeight = Math.max(2, bodyBottom - bodyTop);
                const wickTop = getY(c.high);
                const wickBottom = getY(c.low);
                const candleColor = isUp ? '#10B981' : '#F43F5E';
                const candleW = Math.max(4, chartW / candles.length - 3);

                return (
                  <g key={i} className="transition-all duration-300 ease-out">
                    {/* Upper/Lower Wick */}
                    <line
                      x1={x}
                      y1={wickTop}
                      x2={x}
                      y2={wickBottom}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Candle Body */}
                    <rect
                      x={x - candleW / 2}
                      y={bodyTop}
                      width={candleW}
                      height={bodyHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })
            )}

            {/* SMA 20 Line Overlay */}
            {showSMA20 && sma20Path && (
              <path
                d={sma20Path}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeDasharray="2 1"
                className="transition-all duration-300 ease-out"
              />
            )}

            {/* SMA 50 Line Overlay */}
            {showSMA50 && sma50Path && (
              <path
                d={sma50Path}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.8"
                className="transition-all duration-300 ease-out"
              />
            )}

            {/* Volume Bars at Bottom */}
            {showVolume && (
              <g transform={`translate(0, ${svgHeight - 65})`}>
                <line
                  x1={paddingX}
                  y1={0}
                  x2={svgWidth - paddingX}
                  y2={0}
                  stroke="#1e293b"
                />
                {candles.map((c, i) => {
                  const x = getX(i);
                  const isUp = c.close >= c.open;
                  const barH = (c.volume / maxVol) * 45;
                  const barW = Math.max(3, chartW / candles.length - 3);
                  return (
                    <rect
                      key={i}
                      x={x - barW / 2}
                      y={50 - barH}
                      width={barW}
                      height={barH}
                      fill={isUp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
                      rx="1"
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* Time axis stamps */}
          <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2 px-8">
            <span>{candles[0]?.time}</span>
            <span>{candles[Math.floor(candles.length / 2)]?.time}</span>
            <span>{candles[candles.length - 1]?.time}</span>
          </div>
        </div>

        {/* RSI Panel if enabled */}
        {showRSI && (
          <div className="rounded-xl bg-[#070d18] border border-slate-800 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase">RSI (14 Períodos):</span>
              <span className="text-sm font-mono-numbers font-black text-white">58.4</span>
              <span className="text-[10px] text-slate-400 font-medium">(Zona Neutra / Tendência de Compra)</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span className="text-rose-400">70 Sobrecompra</span>
              <span className="text-emerald-400">30 Sobrevenda</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
