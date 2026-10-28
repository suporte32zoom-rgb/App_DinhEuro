import React from 'react';
import {
  Globe,
  ShieldCheck,
  Server,
  Zap,
  CheckCircle,
  FileText,
  Mail,
  Cpu,
  Lock,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Brand Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1a30] via-[#091120] to-[#060a12] border border-slate-700/80 p-6 sm:p-10 shadow-2xl text-center flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400/40 p-1 mb-5 shadow-2xl shadow-emerald-950/60 bg-white/5">
          <img
            src="/logo.png"
            alt="DinhEuro Logo Oficial"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Dinh<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">Euro</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-widest uppercase mt-1">
          dinheuro.com • Hub Financeiro Global
        </p>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-4 leading-relaxed">
          O <strong>DinhEuro</strong> é a plataforma definitiva de inteligência e acompanhamento financeiro global, desenhada para investidores que pensam além das fronteiras. Unimos a cotação em tempo real de ativos mundiais (Wall Street, B3, Europa e Ásia), câmbio comercial unificado, criptomoedas e commodities no mais alto rigor institucional.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">Conexão Brasil & Europa</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Especializado na ponte econômica entre o Real Brasileiro (R$) e o Euro (€), fornecendo paridades cambiais precisas para remessas, planejamento de cidadania e investimentos no exterior.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">Motor de Dados Finnhub</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Arquitetura de dados orientada à baixa latência via <strong>Finnhub API</strong> e <strong>Banco Central Europeu</strong>. Rejeição integral de APIs obsoletas ou com atrasos (Zero AwesomeAPI).
          </p>
        </div>

        <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">Progressive Web App (PWA)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instalável como aplicativo nativo no Windows, Mac, Android e iOS. Cache inteligente offline, carregamento instantâneo e preparado para deploy na Hostinger.
          </p>
        </div>
      </div>

      {/* Hostinger & Production Ready Specifications */}
      <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>Pronto para Deploy em Produção (Hostinger)</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          O DinhEuro foi estruturado para ser exportado via <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono">npm run build</code> e publicado diretamente no Gerenciador de Arquivos ou Git da <strong>Hostinger (Plano Cloud ou Hospedagem Compartilhada)</strong> com suporte total a HTTPS, service workers e rotas amigáveis SPA via <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-mono">.htaccess</code>.
        </p>
      </div>

      {/* Legal & Terms of Use */}
      <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-6 shadow-xl space-y-4 text-xs text-slate-400 leading-relaxed">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-300" />
          <span>Aviso Legal & Termos de Uso</span>
        </h2>
        <p>
          O DinhEuro (dinheuro.com) é uma plataforma de conteúdo informativo, ferramentas analíticas e agregação de dados públicos do mercado de capitais. As cotações, simuladores e análises apresentadas não constituem oferta, solicitação de compra ou recomendação de investimento personalizada. Investimentos em valores mobiliários, moedas e criptomoedas envolvem risco de perda patrimonial. Recomendamos a consulta a profissionais certificados antes de tomar decisões financeiras.
        </p>
        <p className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          © {new Date().getFullYear()} DinhEuro (dinheuro.com). Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
