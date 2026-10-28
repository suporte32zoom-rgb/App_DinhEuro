import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatCurrencyValue } from '../utils/finance';

export const TickerTape: React.FC = () => {
  const { assets, setSelectedAsset, lastUpdated } = useMarket();

  // Curated list for the ticker
  const tickerItems = assets.slice(0, 14);
  // Duplicate for seamless infinite loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#070d18] border-b border-slate-800/80 text-xs py-1.5 overflow-hidden select-none relative group">
      <div className="flex items-center">
        {/* Live Badge */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-slate-900 border-r border-slate-800 z-10 flex-shrink-0 text-[10px] font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">MERCADOS EM TEMPO REAL</span>
          <span className="sm:hidden">AO VIVO</span>
        </div>

        {/* Ticker marquee */}
        <div className="overflow-hidden flex-1 no-scrollbar">
          <div className="animate-ticker flex items-center gap-6">
            {displayItems.map((item, idx) => {
              const isPositive = item.change24h >= 0;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedAsset(item)}
                  className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-0.5 rounded transition cursor-pointer flex-shrink-0"
                >
                  <span className="font-bold text-slate-200">{item.symbol}</span>
                  <span className="font-mono-numbers text-slate-300">
                    {formatCurrencyValue(item.price, item.currency, item.currency === 'USD' || item.currency === 'BRL' ? (item.price < 10 ? 4 : 2) : 2)}
                  </span>
                  <span
                    className={`flex items-center text-[11px] font-semibold font-mono-numbers ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                    )}
                    {isPositive ? '+' : ''}
                    {item.change24h.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
