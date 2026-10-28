import React, { useState } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Sparkles,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../services/marketData';
import { formatCurrencyValue } from '../utils/finance';

export const MarketsView: React.FC = () => {
  const { assets, setSelectedAsset, lastUpdated } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'symbol' | 'volume'>('change');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const categories = [
    { id: 'all', label: 'Todos os Ativos' },
    { id: 'stocks_us', label: 'Ações EUA (Wall St)' },
    { id: 'stocks_br', label: 'Ações Brasil (B3)' },
    { id: 'indices', label: 'Índices Mundiais' },
    { id: 'forex', label: 'Câmbio & Forex' },
    { id: 'crypto', label: 'Criptomoedas' },
    { id: 'commodities', label: 'Commodities' },
  ];

  // Filter
  const filtered = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch =
      asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
      asset.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'change') {
      comparison = b.change24h - a.change24h;
    } else if (sortBy === 'price') {
      comparison = b.price - a.price;
    } else if (sortBy === 'symbol') {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortBy === 'volume') {
      comparison = b.volume.localeCompare(a.volume);
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  const toggleSort = (newSort: 'change' | 'price' | 'symbol' | 'volume') => {
    if (sortBy === newSort) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Mercados Financeiros Globais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cotações em tempo real de ações mundiais, B3, moedas forex, cripto e commodities via Finnhub.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar ticker ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs (No overflow clipping, smooth horizontal scroll) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Table */}
      <div className="rounded-2xl bg-[#0d1627] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070e1b] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Ativo / Ticker</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('price')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Último Preço</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('change')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Variação 24h</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Máx / Mín (24h)</th>
                <th
                  onClick={() => toggleSort('volume')}
                  className="py-3 px-4 text-right hidden sm:table-cell cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {sorted.map((asset) => {
                const isPositive = asset.change24h >= 0;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-slate-800/50 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{asset.flag || '📈'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-xs group-hover:text-emerald-400 transition">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                              {asset.category.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[140px] sm:max-w-xs">
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white text-xs sm:text-sm">
                      {formatCurrencyValue(asset.price, asset.currency, asset.price < 10 ? 4 : 2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-mono-numbers font-bold text-xs px-2 py-0.5 rounded ${
                          isPositive
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right hidden md:table-cell font-mono-numbers text-[11px] text-slate-400">
                      <div>
                        {formatCurrencyValue(asset.high24h, asset.currency)} /{' '}
                        {formatCurrencyValue(asset.low24h, asset.currency)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right hidden sm:table-cell font-mono-numbers text-xs text-slate-300">
                      {asset.volume}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
