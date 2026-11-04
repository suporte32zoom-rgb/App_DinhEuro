import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Sparkles,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../services/marketData';
import { formatCurrencyValue } from '../utils/finance';
import { DualPrice } from '../components/DualPrice';

export const MarketsView: React.FC = () => {
  const { assets, setSelectedAsset, lastUpdated, universalRates, refreshData, apiSourceSummary } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'symbol' | 'volume'>('change');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Dynamic counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: assets.length,
      stocks_us: 0,
      stocks_br: 0,
      indices: 0,
      forex: 0,
      crypto: 0,
      commodities: 0,
    };
    assets.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });
    return counts;
  }, [assets]);

  const categories = [
    { id: 'all', label: 'Todos os Ativos', count: categoryCounts.all },
    { id: 'stocks_us', label: 'Ações EUA (Wall St)', count: categoryCounts.stocks_us },
    { id: 'stocks_br', label: 'Ações Brasil (B3)', count: categoryCounts.stocks_br },
    { id: 'indices', label: 'Índices Mundiais', count: categoryCounts.indices },
    { id: 'forex', label: 'Câmbio & Forex', count: categoryCounts.forex },
    { id: 'crypto', label: 'Criptomoedas', count: categoryCounts.crypto },
    { id: 'commodities', label: 'Commodities', count: categoryCounts.commodities },
  ];

  // Filter
  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        asset.symbol.toLowerCase().includes(term) ||
        asset.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [assets, selectedCategory, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortBy, sortOrder]);

  // Paginated / Expanded slice
  const displayedAssets = useMemo(() => {
    return sorted.slice(0, visibleCount);
  }, [sorted, visibleCount]);

  const toggleSort = (newSort: 'change' | 'price' | 'symbol' | 'volume') => {
    if (sortBy === newSort) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, sorted.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(sorted.length);
  };

  const handleCollapse = () => {
    setVisibleCount(20);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const remainingCount = sorted.length - visibleCount;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header, Real-Time Indicators & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Cotações em Tempo Real • Zero Defasagem
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Mercados Financeiros Globais
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span>{assets.length} ativos catalogados</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Fontes: {apiSourceSummary}</span>
            <span>•</span>
            <span>Última atualização: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>

        {/* Action Controls: Refresh & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 hover:border-emerald-500/40 transition cursor-pointer shrink-0 disabled:opacity-50"
            title="Atualizar cotações em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por ticker ou nome..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(20); // Reset page limit on new search
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs with Dynamic Live Counters */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(20);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/30 text-emerald-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Status & Catalog Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Exibindo <strong className="text-white font-mono">{displayedAssets.length}</strong> de{' '}
            <strong className="text-white font-mono">{sorted.length}</strong> ativos encontrados
          </span>
          {search && (
            <span className="text-emerald-400 font-medium">
              (termo: &ldquo;{search}&rdquo;)
            </span>
          )}
        </div>
        {sorted.length > 20 && (
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {visibleCount >= sorted.length ? 'Catálogo 100% visível' : `${remainingCount} ativos prontos para expansão`}
          </div>
        )}
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
                    <span>Preço Oficial & Dupla Conversão</span>
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
                    <span>Volume 24h</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Terminal Gráfico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {displayedAssets.map((asset) => {
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
                            <span className="font-extrabold text-white text-xs group-hover:text-emerald-400 transition font-mono">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/50">
                              {asset.category.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[140px] sm:max-w-xs">
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <DualPrice
                        price={asset.price}
                        currency={asset.currency}
                        rates={universalRates}
                        layout="compact"
                        primaryClassName="font-mono-numbers font-bold text-white text-xs sm:text-sm"
                        secondaryClassName="text-[11px] font-mono-numbers text-emerald-400 font-medium"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
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
                        <span className="text-[10px] font-mono-numbers text-slate-400 mt-0.5">
                          {asset.changeValue >= 0 ? '+' : ''}
                          {formatCurrencyValue(asset.changeValue, asset.currency, asset.currency === 'JPY' ? 0 : asset.price < 5 ? 4 : 2)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right hidden md:table-cell font-mono-numbers text-[11px] text-slate-400">
                      <div>
                        {formatCurrencyValue(asset.high24h, asset.currency, asset.currency === 'JPY' ? 0 : asset.price < 5 ? 4 : 2)} /{' '}
                        {formatCurrencyValue(asset.low24h, asset.currency, asset.currency === 'JPY' ? 0 : asset.price < 5 ? 4 : 2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right hidden sm:table-cell font-mono-numbers text-xs text-slate-300">
                      {asset.volume}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>D3 v7</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {displayedAssets.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-400">
              Nenhum ativo encontrado para os filtros selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC CATALOG EXPANSION ENGINE ("Ver Mais Ativos") */}
      {sorted.length > 20 && (
        <div className="bg-[#0b1424] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">
                Status da Cobertura de Mercados:
              </span>
              <span className="text-slate-400">
                {displayedAssets.length} de {sorted.length} ativos renderizados
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (displayedAssets.length / sorted.length) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {remainingCount > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer inline-flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4 stroke-[3]" />
                  <span>Ver Mais Ativos (+{Math.min(20, remainingCount)} de {remainingCount} disponíveis)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadAll}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Carregar Todos os {sorted.length} Mercados Globais</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Catálogo Completo Carregado ({sorted.length} ativos mundiais)</span>
                </div>

                <button
                  type="button"
                  onClick={handleCollapse}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer inline-flex items-center gap-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Recolher para Top 20</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
