import React from 'react';
import {
  Cookie,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const CookiePolicyView: React.FC = () => {
  const { setActiveTab } = useMarket();

  const handleResetCookieConsent = () => {
    localStorage.removeItem('dinheuro_lgpd_accepted');
    window.dispatchEvent(new Event('dinheuro_reopen_cookie_banner'));
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          Transparência & Gestão de Cookies
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121626] via-[#091122] to-[#060c16] border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Política de Cookies e Tecnologias de Rastreamento
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Entenda como o DinhEuro utiliza cookies essenciais, armazenamento local (localStorage) e service workers no PWA para garantir estabilidade, segurança e personalização sem invadir sua privacidade.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Cookie Preference Action Box */}
      <div className="rounded-2xl bg-[#0b1424] border border-amber-500/30 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Gerenciar seu Consentimento no DinhEuro</span>
          </span>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Você pode alterar ou revogar sua decisão de consentimento para cookies e armazenamento local a qualquer momento. Ao redefinir, o banner de consentimento reaparecerá imediatamente na tela.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetCookieConsent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Redefinir Preferências de Cookies</span>
        </button>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        {/* 1. O que são cookies */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>1. O que são Cookies e Tecnologias Similares?</span>
          </h2>
          <p>
            Cookies são pequenos arquivos de texto enviados pelo servidor web e armazenados no navegador do usuário. No contexto de aplicações modernas como o Progressive Web App (PWA) do DinhEuro, tecnologias complementares como o <strong>localStorage</strong> e <strong>Service Workers (Cache Storage)</strong> desempenham papel análogo, viabilizando o carregamento instantâneo offline e a persistência de configurações pessoais sem necessidade de login.
          </p>
        </div>

        {/* 2. Categorias de Cookies Usadas */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>2. Categorias de Cookies e Armazenamento Utilizados</span>
          </h2>

          <div className="space-y-3">
            {/* Categoria 1: Essenciais */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>A. Cookies e Storage Estritamente Necessários (Obrigatórios)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Sempre Ativos</span>
              </div>
              <p className="text-xs text-slate-400">
                Essenciais para o funcionamento básico, segurança contra requisições forjadas e memorização da sua escolha de consentimento. Sem eles, o site não opera de forma estável.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div>• <strong className="text-slate-200">dinheuro_lgpd_accepted:</strong> registra a aceitação dos termos de privacidade.</div>
                <div>• <strong className="text-slate-200">workbox-precache:</strong> armazena arquivos da casca do aplicativo no PWA para funcionamento offline.</div>
              </div>
            </div>

            {/* Categoria 2: Preferências & Funcionalidade */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>B. Preferências e Personalização (Funcionais)</span>
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Personalização</span>
              </div>
              <p className="text-xs text-slate-400">
                Armazenam suas escolhas estéticas e organizacionais para que você não precise reconfigurar o aplicativo a cada nova visita.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div>• <strong className="text-slate-200">dinheuro_theme:</strong> guarda a seleção de Tema Escuro ou Claro.</div>
                <div>• <strong className="text-slate-200">dinheuro_user_portfolio_v1:</strong> armazena os ativos e quantidades cadastradas na aba Minhas Carteiras no dispositivo do usuário.</div>
                <div>• <strong className="text-slate-200">finnhub_api_key_custom:</strong> guarda chave de API informada voluntariamente para cotações proprietárias.</div>
              </div>
            </div>

            {/* Categoria 3: Análise e Desempenho */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>C. Desempenho e Diagnóstico Técnico</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Otimização</span>
              </div>
              <p className="text-xs text-slate-400">
                Métricas anônimas e agregadas de latência na renderização de gráficos D3 e tempos de resposta de cotações em tempo real para prevenção de falhas sistêmicas. Não identificam o usuário pessoalmente.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Como Desativar no Navegador */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>3. Como Gerenciar ou Desativar Cookies no seu Navegador</span>
          </h2>
          <p>
            Você pode bloquear ou excluir cookies a qualquer momento nas opções de privacidade do seu navegador. Note que a desativação de cookies essenciais ou do localStorage pode desativar recursos essenciais, como a retenção das suas carteiras e o modo offline do PWA.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">Google Chrome:</strong>
              <p className="text-slate-400">Configurações → Privacidade e Segurança → Cookies de terceiros e dados de sites.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">Mozilla Firefox:</strong>
              <p className="text-slate-400">Opções → Privacidade e Segurança → Cookies e dados de sites → Limpar dados.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">Apple Safari (iOS / macOS):</strong>
              <p className="text-slate-400">Ajustes / Preferências → Safari → Privacidade → Bloquear todos os cookies.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">Microsoft Edge:</strong>
              <p className="text-slate-400">Configurações → Cookies e permissões do site → Gerenciar e excluir dados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
