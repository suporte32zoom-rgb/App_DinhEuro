import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Activity,
  Layers,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { generateAssetCandles } from '../services/marketData';
import { formatCurrencyValue } from '../utils/finance';

export const AssetDetailModal: React.FC = () => {
  const { selectedAsset, setSelectedAsset, setActiveTab, addPortfolioPosition } = useMarket();
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1A'>('1D');
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [addedToast, setAddedToast] = useState(false);

  if (!selectedAsset) return null;

  const isPositive = selectedAsset.change24h >= 0;
  const candles = generateAssetCandles(selectedAsset.price, timeframe);

  // SVG Chart Dimensions
  const minVal = Math.min(...candles.map((c) => c.low));
  const maxVal = Math.max(...candles.map((c) => c.high));
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 240;
  const paddingX = 30;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const getY = (val: number) => {
    return svgHeight - paddingY - ((val - minVal) / range) * chartH;
  };

  const getX = (idx: number) => {
    return paddingX + (idx / (candles.length - 1)) * chartW;
  };

  const linePath = candles.reduce((acc, c, idx) => {
    const x = getX(idx);
    const y = getY(c.close);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${svgWidth - paddingX} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  const handleQuickAddToPortfolio = () => {
    let assetType: 'stock_br' | 'stock_us' | 'crypto' | 'forex' = 'stock_us';
    if (selectedAsset.category === 'stocks_br') assetType = 'stock_br';
    else if (selectedAsset.category === 'crypto') assetType = 'crypto';
    else if (selectedAsset.category === 'forex') assetType = 'forex';

    addPortfolioPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      assetType,
      quantity: selectedAsset.category === 'crypto' ? 0.05 : 10,
      averageBuyPrice: selectedAsset.price,
      currency: selectedAsset.currency,
      purchaseDate: new Date().toISOString().split('T')[0],
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleOpenAdvanced = () => {
    setSelectedAsset(null);
    setActiveTab('graficos');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedAsset(null)}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-[#0d1627] border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#09101d]">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{selectedAsset.flag || '📊'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{selectedAsset.symbol}</h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedAsset.category}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {selectedAsset.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedAsset(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* Price & Summary Stats */}
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-white">
                {formatCurrencyValue(selectedAsset.price, selectedAsset.currency, selectedAsset.price < 10 ? 4 : 2)}
              </div>
              <div
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold font-mono-numbers mt-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPositive ? '+' : ''}
                  {selectedAsset.changeValue.toFixed(2)} ({isPositive ? '+' : ''}
                  {selectedAsset.change24h.toFixed(2)}%)
                </span>
                <span className="text-slate-400 font-normal text-xs ml-1">Hoje</span>
              </div>
            </div>

            {/* Controls: Timeframe & Chart Style */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['1D', '5D', '1M', '6M', '1A'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                      timeframe === tf
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setChartType('candle')}
                  className={`px-2 py-1 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                    chartType === 'candle' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Gráfico de Velas Japonesas"
                >
                  Velas
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-1 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                    chartType === 'line' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Gráfico de Linha"
                >
                  Linha
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic SVG Chart */}
          <div className="relative bg-[#070e1b] rounded-xl border border-slate-800/80 p-2 sm:p-4 overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 sm:h-64 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
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
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={svgWidth - paddingX + 5}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {priceLevel.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {chartType === 'line' ? (
                <>
                  <path d={areaPath} fill="url(#chartGradient)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={isPositive ? '#10B981' : '#F43F5E'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                /* Candlestick bars */
                candles.map((c, i) => {
                  const x = getX(i);
                  const isUp = c.close >= c.open;
                  const bodyTop = getY(Math.max(c.open, c.close));
                  const bodyBottom = getY(Math.min(c.open, c.close));
                  const bodyHeight = Math.max(2, bodyBottom - bodyTop);
                  const wickTop = getY(c.high);
                  const wickBottom = getY(c.low);
                  const candleColor = isUp ? '#10B981' : '#F43F5E';
                  const candleW = Math.max(3, chartW / candles.length - 2);

                  return (
                    <g key={i}>
                      {/* Wick */}
                      <line
                        x1={x}
                        y1={wickTop}
                        x2={x}
                        y2={wickBottom}
                        stroke={candleColor}
                        strokeWidth="1.2"
                      />
                      {/* Body */}
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
            </svg>

            {/* Time labels below chart */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-6">
              <span>{candles[0]?.time}</span>
              <span>{candles[Math.floor(candles.length / 2)]?.time}</span>
              <span>{candles[candles.length - 1]?.time}</span>
            </div>
          </div>

          {/* Key Fundamentals and Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Máxima 24h</span>
              <p className="text-sm font-semibold font-mono-numbers text-white mt-0.5">
                {formatCurrencyValue(selectedAsset.high24h, selectedAsset.currency)}
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Mínima 24h</span>
              <p className="text-sm font-semibold font-mono-numbers text-white mt-0.5">
                {formatCurrencyValue(selectedAsset.low24h, selectedAsset.currency)}
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Volume 24h</span>
              <p className="text-sm font-semibold font-mono-numbers text-white mt-0.5">
                {selectedAsset.volume}
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Valor de Mercado</span>
              <p className="text-sm font-semibold font-mono-numbers text-white mt-0.5">
                {selectedAsset.marketCap || 'N/D'}
              </p>
            </div>
            {selectedAsset.peRatio && (
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">P/L (P/E)</span>
                <p className="text-sm font-semibold font-mono-numbers text-white mt-0.5">
                  {selectedAsset.peRatio}x
                </p>
              </div>
            )}
            {selectedAsset.dividendYield !== undefined && (
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Dividend Yield</span>
                <p className="text-sm font-semibold font-mono-numbers text-emerald-400 mt-0.5">
                  {selectedAsset.dividendYield}% a.a.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#09101d] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {addedToast ? (
              <span className="text-emerald-400 font-semibold animate-pulse">
                ✓ Posição adicionada à sua Carteira!
              </span>
            ) : (
              <span>Dados cotados via Finnhub API & ECB</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAddToPortfolio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Adicionar à Carteira</span>
            </button>
            <button
              onClick={handleOpenAdvanced}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white shadow-md shadow-emerald-950 transition cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Gráficos Avançados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
