import React from 'react';
import {
  AlertTriangle,
  Radio,
  Server,
  Scale,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const DisclaimerView: React.FC = () => {
  const { setActiveTab } = useMarket();

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
        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
          Aviso Regulatório Obrigatório
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1207] via-[#140e06] to-[#0a0703] border border-amber-500/40 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Aviso Legal & Disclaimer Financeiro
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Origem dos dados de mercado, política de latência de cotações e ressalva regulatória sobre ausência de consultoria de valores mobiliários no DinhEuro.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        {/* 1. Ausência de Recomendação */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>1. Ausência de Consultoria ou Recomendação de Investimento</span>
          </h2>
          <p>
            O portal <strong>DinhEuro</strong> (<span className="text-emerald-400 font-mono">dinheuro.com</span> / <span className="text-emerald-400 font-mono">dinheuro.com.br</span>) destina-se <strong>exclusivamente a fins informativos, analíticos, estatísticos e educacionais</strong>.
          </p>
          <p>
            Nenhum conteúdo divulgado na plataforma — incluindo índices, indicadores técnicos (SMA, RSI), diagnósticos com inteligência artificial, simuladores de juros compostos ou conversões de paridade Euro-Dólar-Real — deve ser interpretado como aconselhamento financeiro, recomendação de alocação de ativos, solicitação de compra ou venda de ações, títulos ou moedas, ou parecer tributário.
          </p>
        </div>

        {/* 2. Provedores de Dados e Latência */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>2. Provedores Oficiais de Dados e Condições de Mercado</span>
          </h2>
          <p>
            O DinhEuro agrega dados de provedores consolidados e fontes públicas oficiais internacionais:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">• Finnhub Stock API</span>
              <p className="text-[11px] text-slate-400">Cotações em tempo real de ações norte-americanas (Wall Street), dados de fechamento e fundamentos de empresas.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-blue-400 block">• Banco Central Europeu (BCE) & AwesomeAPI</span>
              <p className="text-[11px] text-slate-400">Taxas de câmbio comercial e paridades de moedas soberanas (EUR, USD, BRL, GBP, JPY, CHF).</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-amber-400 block">• Binance & Crypto APIs</span>
              <p className="text-[11px] text-slate-400">Preços e variações de 24 horas dos principais ativos digitais globais (BTC, ETH, SOL, BNB).</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-purple-400 block">• Brapi & Índices B3</span>
              <p className="text-[11px] text-slate-400">Cotações das principais companhias listadas na Bolsa de Valores do Brasil (B3) e pontuação do Ibovespa.</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs pt-1">
            <strong>Ressalva de Latência:</strong> Salvo expressa indicação em contrário, os dados de mercado não são necessariamente fornecidos com execução no milissegundo de tick por bolsas de valores, podendo conter atrasos normais de transmissão de rede de 1 a 15 minutos dependendo da bolsa de origem.
          </p>
        </div>

        {/* 3. Riscos de Perda de Capital */}
        <div className="rounded-2xl bg-red-950/20 border border-red-500/30 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>3. Riscos Associados à Negociação nos Mercados Financeiros</span>
          </h2>
          <p className="text-slate-200">
            A negociação de instrumentos financeiros, pares de moedas (Forex), derivativos, contratos futuros e criptomoedas envolve risco substancial de perda do patrimônio investido.
          </p>
          <p className="text-slate-400">
            Rentabilidade pretérita não constitui garantia de rentabilidade futura. Flutuações nas taxas de câmbio podem gerar efeitos adversos sobre o valor, preço ou rentabilidade de qualquer investimento denominado em moeda estrangeira.
          </p>
        </div>

        {/* 4. Limitação de Responsabilidade */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>4. Limitação de Responsabilidade Técnica</span>
          </h2>
          <p>
            Em nenhuma circunstância o DinhEuro, seus desenvolvedores, mantenedores ou parceiros tecnológicos serão responsáveis por qualquer perda direta, indireta, incidental, especial ou consequente resultante de erros, imprecisões nas cotações ou indisponibilidade temporária de servidores.
          </p>
          <p className="text-slate-400 text-xs pt-2 border-t border-slate-800/80">
            Dúvidas regulatórias ou comunicação formal: <a href="mailto:admin@dinheuro.com.br" className="text-emerald-400 hover:underline font-mono">admin@dinheuro.com.br</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
