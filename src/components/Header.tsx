import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Menu,
  Check,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { useMarket, NavigationTab } from '../context/MarketContext';
import { PWAInstallButton } from './PWAInstallButton';
import { formatCurrencyValue } from '../utils/finance';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    assets,
    setSelectedAsset,
    displayCurrency,
    setDisplayCurrency,
    theme,
    toggleTheme,
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [worldTimes, setWorldTimes] = useState({
    sp: '',
    ny: '',
    lon: '',
    fra: '',
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update clocks every second
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setWorldTimes({
        sp: now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }),
        ny: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' }),
        lon: now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }),
        fra: now.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }),
      });
    };
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: NavigationTab; label: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Início' },
    { id: 'mercados', label: 'Mercados' },
    { id: 'carteiras', label: 'Carteiras' },
    { id: 'noticias', label: 'Notícias & Análises' },
    { id: 'corretoras', label: 'Corretoras' },
    { id: 'graficos', label: 'Gráficos Avançados' },
    { id: 'ferramentas', label: 'Ferramentas' },
    { id: 'academy', label: 'Academy' },
    { id: 'sobre', label: 'Sobre o DinhEuro' },
  ];

  // Filter assets for search
  const filteredAssets = searchQuery.trim()
    ? assets.filter(
        (a) =>
          a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : assets.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 bg-[#0B1320]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Bar */}
      <div className="border-b border-slate-800/60 bg-[#070e1a]/80 px-3 sm:px-6 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* World financial hub clocks */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 flex-nowrap">
            <span className="flex items-center gap-1 font-semibold text-slate-300 flex-shrink-0">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Centros Financeiros:</span>
            </span>
            <span className="flex-shrink-0 text-slate-400">
              🇧🇷 SP <strong className="text-slate-200 font-mono-numbers">{worldTimes.sp}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex-shrink-0 text-slate-400">
              🇺🇸 NY <strong className="text-slate-200 font-mono-numbers">{worldTimes.ny}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex-shrink-0 text-slate-400">
              🇩🇪 FRA <strong className="text-slate-200 font-mono-numbers">{worldTimes.fra}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex-shrink-0 text-slate-400">
              🇬🇧 LON <strong className="text-slate-200 font-mono-numbers">{worldTimes.lon}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="DinhEuro Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition duration-200 border-2 border-amber-400/30"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B1320] rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Dinh<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">Euro</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider hidden xs:inline">
                Global
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 tracking-wide">
              Hub Financeiro Global & Mercados
            </span>
          </div>
        </div>

        {/* Global Asset Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ações (AAPL, PETR4), pares forex, cripto, índices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Search trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Abrir busca"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-semibold">
            {(['BRL', 'EUR', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setDisplayCurrency(curr)}
                className={`px-2 py-1 rounded-md transition cursor-pointer text-[11px] ${
                  displayCurrency === curr
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr === 'BRL' ? 'R$' : curr === 'EUR' ? '€' : '$'}
              </button>
            ))}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={theme === 'dark' ? 'Alternar para tema claro (Clean Finance)' : 'Alternar para tema escuro (Terminal)'}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm flex-shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-[11px]">Tema Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden lg:inline text-[11px]">Tema Escuro</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>

      {/* Universal Responsive Horizontal Navigation Bar
          Strictly prevents wrapping, button clipping or horizontal layout breaking on any device */}
      <nav
        className="w-full border-t border-slate-800/80 bg-[#08101e]/90 px-3 sm:px-6"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="max-w-7xl mx-auto w-full flex items-center gap-1 sm:gap-2 py-1.5 no-scrollbar"
          style={{
            flexWrap: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 select-none flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Instant Search Results Modal */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3">
              <Search className="w-5 h-5 text-emerald-400" />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                placeholder="Digite o código (ex: PETR4, AAPL, BTC, EUR/BRL, OURO)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5 no-scrollbar">
              <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                {searchQuery ? 'Resultados Encontrados' : 'Ativos em Destaque'}
              </p>

              {filteredAssets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum ativo encontrado para "{searchQuery}". Tente outro símbolo ou nome.
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isPositive = asset.change24h >= 0;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowSearchModal(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{asset.flag || '📈'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{asset.symbol}</span>
                            <span className="text-[10px] text-slate-400 uppercase px-1.5 py-0.2 rounded bg-slate-800">
                              {asset.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                            {asset.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono-numbers text-xs font-semibold text-white">
                          {formatCurrencyValue(asset.price, asset.currency)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold font-mono-numbers ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {asset.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
