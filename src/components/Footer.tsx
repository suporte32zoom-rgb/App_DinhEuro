import React from 'react';
import {
  ShieldCheck,
  Globe,
  ArrowUp,
  FileText,
  Lock,
  Cookie,
  AlertTriangle,
  Mail,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useMarket, NavigationTab } from '../context/MarketContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useMarket();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReopenCookieBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('dinheuro_lgpd_accepted');
    window.dispatchEvent(new Event('dinheuro_reopen_cookie_banner'));
  };

  return (
    <footer className="bg-[#050a14] border-t border-slate-800/90 text-slate-400 text-xs mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand, Identity & DPO */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Novo Logo Oficial DinhEuro"
                className="w-10 h-10 rounded-full border border-amber-400/50 shadow-md bg-white/5"
              />
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  Dinh<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">Euro</span>
                </span>
                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Hub Global de Finanças e Moedas
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Plataforma digital de dados econômicos em tempo real, paridade universal Euro-Dólar-Real, cotações mundiais e ferramentas analíticas sem paywall.
            </p>

            {/* Compliance & Status Badges */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Operação Global • Hostinger Production Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Em conformidade com a LGPD (Lei nº 13.709/2018) & SSL 256-bit</span>
              </div>
            </div>

            {/* DPO Direct Contact */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Encarregado de Dados (DPO):</span>
              <a
                href="mailto:admin@dinheuro.com.br"
                className="text-emerald-400 hover:underline font-mono font-medium"
              >
                admin@dinheuro.com.br
              </a>
            </div>
          </div>

          {/* Col 3: Navegação Hub */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Navegação do Hub
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Início (Dashboard)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('mercados')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Mercados Mundiais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('carteiras')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Minhas Carteiras
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('noticias')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Notícias & Análises
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('corretoras')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Guia de Corretoras
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Recursos & Análise */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Recursos & Análise
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('graficos')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Terminal Gráfico D3 v7
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('ferramentas')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Simuladores & Câmbio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('academy')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Academy & Glossário
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('sobre')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left font-semibold text-slate-300"
                >
                  Sobre o DinhEuro
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition pt-1 cursor-pointer font-semibold"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Voltar ao topo</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Jurídico & Compliance (Obrigatório) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jurídico & LGPD</span>
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('termos')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Termos de Uso</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('privacidade')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Política de Privacidade</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('cookies')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Política de Cookies</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('disclaimer')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Aviso Legal / Disclaimer</span>
                </button>
              </li>
              <li className="pt-1.5">
                <button
                  type="button"
                  onClick={handleReopenCookieBanner}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Preferências de Cookies</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Financeiro e Transparência de Dados */}
        <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-slate-400">Aviso de Risco e Isenção de Responsabilidade Financeira:</strong> O DinhEuro (<span className="text-emerald-400 font-mono">dinheuro.com</span> / <span className="text-emerald-400 font-mono">dinheuro.com.br</span>) é um portal digital informativo e educacional de agregação de dados públicos. As cotações em tempo real de ativos mundiais, taxas de câmbio (Euro, Dólar, Real), ações da B3, criptoativos e simuladores são transmitidos via integrações oficiais com provedores como Finnhub, Banco Central Europeu, Binance e Brapi. O DinhEuro não presta consultoria de investimentos, análise de valores mobiliários ou recomendação direta de aporte financeiro. A negociação em mercados de renda variável e Forex envolve alto risco de perda do patrimônio investido.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/40 text-slate-500 text-[11px]">
            <span>
              © {new Date().getFullYear()} DinhEuro (dinheuro.com / dinheuro.com.br). Todos os direitos reservados.
            </span>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('termos')}
                className="hover:text-white transition cursor-pointer"
              >
                Termos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('privacidade')}
                className="hover:text-white transition cursor-pointer"
              >
                Privacidade
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('cookies')}
                className="hover:text-white transition cursor-pointer"
              >
                Cookies
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('disclaimer')}
                className="hover:text-white transition cursor-pointer"
              >
                Disclaimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
