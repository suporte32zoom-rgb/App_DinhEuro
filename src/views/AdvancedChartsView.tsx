import React, { useState } from 'react';
import { BarChart2, Layers } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { UnifiedAssetDetailView } from '../components/UnifiedAssetDetailView';

export const AdvancedChartsView: React.FC = () => {
  const { assets, setActiveTab } = useMarket();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('IBOVESPA');

  const currentAsset =
    assets.find((a) => a.symbol === selectedSymbol || a.id === selectedSymbol) || assets[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Asset Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Terminal de Análise Técnica & Gráficos Avançados</span>
            </h1>
            <p className="text-xs text-slate-400">
              Motor Gráfico D3 v7 institucional com análise diagnóstica de inteligência artificial.
            </p>
          </div>
        </div>

        {/* Global Asset Dropdown */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Selecionar Ativo:
          </label>
          <select
            value={currentAsset.symbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 shadow-md cursor-pointer"
          >
            <optgroup label="Índices Globais">
              {assets
                .filter((a) => a.category === 'indices')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Ações B3 (Brasil)">
              {assets
                .filter((a) => a.category === 'stocks_br')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Ações Internacionais (EUA)">
              {assets
                .filter((a) => a.category === 'stocks_us')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Câmbio & Forex">
              {assets
                .filter((a) => a.category === 'forex')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Criptoativos">
              {assets
                .filter((a) => a.category === 'crypto')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Commodities">
              {assets
                .filter((a) => a.category === 'commodities')
                .map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Unified Asset Detail & D3 v7 Charting View */}
      <UnifiedAssetDetailView
        asset={currentAsset}
        onBack={() => setActiveTab('dashboard')}
      />
    </div>
  );
};
