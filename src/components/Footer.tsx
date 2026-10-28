import React from 'react';
import { ShieldCheck, Globe, ArrowUp, Sparkles } from 'lucide-react';
import { useMarket, NavigationTab } from '../context/MarketContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useMarket();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks: { tab: NavigationTab; label: string }[] = [
    { tab: 'dashboard', label: 'Início (Dashboard)' },
    { tab: 'mercados', label: 'Mercados Mundiais' },
    { tab: 'carteiras', label: 'Minhas Carteiras' },
    { tab: 'noticias', label: 'Notícias & Análises' },
    { tab: 'corretoras', label: 'Guia de Corretoras' },
    { tab: 'graficos', label: 'Gráficos Avançados' },
    { tab: 'ferramentas', label: 'Simuladores & Câmbio' },
    { tab: 'academy', label: 'Academy & Glossário' },
    { tab: 'sobre', label: 'Sobre o DinhEuro' },
  ];

  return (
    <footer className="bg-[#060c16] border-t border-slate-800/80 text-slate-400 text-xs mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DinhEuro Logo"
                className="w-9 h-9 rounded-full border border-amber-400/40"
              />
              <span className="text-xl font-black text-white tracking-tight">
                Dinh<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">Euro</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              O portal financeiro de alta precisão para quem investe no Brasil e no exterior. Cotações em tempo real via Finnhub, conversão universal Euro-Dólar-Real e análises de mercado.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Operação Global • Hostinger Production Architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Navegação do Hub
            </span>
            <ul className="space-y-1.5 text-xs">
              {navLinks.slice(0, 5).map((l) => (
                <li key={l.tab}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(l.tab);
                    }}
                    className="hover:text-emerald-400 transition cursor-pointer text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Ferramentas & Educação */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Recursos & Análise
            </span>
            <ul className="space-y-1.5 text-xs">
              {navLinks.slice(5).map((l) => (
                <li key={l.tab}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(l.tab);
                    }}
                    className="hover:text-emerald-400 transition cursor-pointer text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    scrollToTop();
                  }}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition pt-1 cursor-pointer font-semibold"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Voltar ao topo</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Financeiro (Investing standard) */}
        <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Aviso de Risco e Isenção:</strong> A negociação de instrumentos financeiros, pares de moedas (Forex), contratos por diferença (CFDs) e ativos digitais (Cripto) envolve alto risco de perda do capital investido. Os preços dos ativos financeiros cotados podem sofrer oscilações significativas devido a eventos macroeconômicos e geopolíticos globais. Os dados disponibilizados no DinhEuro não são necessariamente fornecidos em tempo de tick por bolsas de valores, podendo conter latências de provedores de mercado como Finnhub.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/40 text-slate-500 text-[11px]">
            <span>
              © {new Date().getFullYear()} DinhEuro (dinheuro.com). Todos os direitos reservados.
            </span>
            <span>Feito para investidores globais</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
