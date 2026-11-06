import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Bell,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  Maximize2,
  Share2,
} from 'lucide-react';
import { MarketAsset } from '../services/marketData';
import { useMarket } from '../context/MarketContext';
import { getDualCurrencyDisplay } from '../utils/finance';
import { getAssetMetadata } from '../utils/assetProfiles';
import { D3AdvancedChart } from './D3AdvancedChart';

interface UnifiedAssetDetailViewProps {
  asset: MarketAsset;
  onBack?: () => void;
  isModal?: boolean;
}

export const UnifiedAssetDetailView: React.FC<UnifiedAssetDetailViewProps> = ({
  asset,
  onBack,
  isModal = false,
}) => {
  const { assets, universalRates, addPortfolioPosition, setActiveTab, setSelectedAsset } = useMarket();

  // Local interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState(asset.price.toString());
  const [portfolioToast, setPortfolioToast] = useState(false);

  const meta = getAssetMetadata(asset);
  const isPositive = asset.change24h >= 0;

  // Dual Currency calculations
  const dual = getDualCurrencyDisplay(asset.price, asset.currency, universalRates);
  const refRate =
    asset.currency === 'USD'
      ? `1 USD = R$ ${universalRates.BRL.toFixed(4)}`
      : asset.currency === 'EUR'
      ? `1 EUR = R$ ${(universalRates.BRL / (universalRates.EUR || 0.895)).toFixed(4)}`
      : `1 USD = R$ ${universalRates.BRL.toFixed(4)}`;

  const nowFormatted = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleAddPortfolio = () => {
    let assetType: 'stock_br' | 'stock_us' | 'crypto' | 'forex' = 'stock_br';
    if (asset.category === 'stocks_us') assetType = 'stock_us';
    else if (asset.category === 'crypto') assetType = 'crypto';
    else if (asset.category === 'forex') assetType = 'forex';

    addPortfolioPosition({
      symbol: asset.symbol,
      name: asset.name,
      assetType,
      quantity: asset.category === 'crypto' ? 0.05 : 10,
      averageBuyPrice: asset.price,
      currency: asset.currency,
      purchaseDate: new Date().toISOString().split('T')[0],
    });

    setPortfolioToast(true);
    setTimeout(() => setPortfolioToast(false), 2500);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertActive(true);
    setShowAlertModal(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. Cabeçalho de Navegação e Ações do Ativo */}
      <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          {/* Voltar para Visão Geral */}
          <button
            onClick={() => {
              if (onBack) onBack();
              else setActiveTab('dashboard');
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition" />
            <span>Voltar para Visão Geral</span>
          </button>

          {/* Action Buttons: Day Trade Pro, Seguir Ativo, Adicionar Alerta, Adicionar ao Portfólio */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Operar no Day Trade Pro */}
            <button
              onClick={() => {
                setSelectedAsset(asset);
                if (onBack) onBack();
                setActiveTab('daytrade');
              }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/40 shadow-sm cursor-pointer transition active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operar Day Trade Pro</span>
            </button>
            {/* Seguir Ativo */}
            <button
              onClick={() => setIsFollowing((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                isFollowing
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFollowing ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFollowing ? 'Seguindo Ativo' : 'Seguir Ativo'}</span>
            </button>

            {/* Adicionar Alerta */}
            <button
              onClick={() => setShowAlertModal(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                alertActive
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${alertActive ? 'fill-sky-400 text-sky-400' : ''}`} />
              <span>{alertActive ? 'Alerta Ativo' : 'Adicionar Alerta'}</span>
            </button>

            {/* Botão de Destaque: Adicionar ao Portfólio */}
            <button
              onClick={handleAddPortfolio}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer transition active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Adicionar ao Portfólio</span>
            </button>
          </div>
        </div>

        {/* Ticker, Origem, Tags e Status AO VIVO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl">{asset.flag || '📊'}</span>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {meta.ticker}
                  </h1>
                  <span className="text-sm font-semibold text-slate-300">
                    {asset.name}
                  </span>
                  {/* Status de Mercado: AO VIVO */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AO VIVO
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300 font-semibold">{meta.marketOrigin}</span>
                  <span>•</span>
                  <span>Cotação Oficial em Tempo Real</span>
                </div>
              </div>
            </div>

            {/* Tags de Categoria */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {meta.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 border border-slate-700/80 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Descrição Institucional Resumida */}
        <div className="bg-[#070e1b] rounded-xl p-3 sm:p-4 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <p>{meta.description}</p>
        </div>
      </div>

      {/* 2. Bloco Principal de Cotação e Dupla Conversão */}
      <div className="bg-gradient-to-br from-[#0c1626] via-[#0b1322] to-[#070e1b] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Primary and Converted Values */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Cotação Atual & Dupla Conversão
          </span>
          <div className="flex flex-wrap items-baseline gap-3">
            {/* Moeda Principal */}
            <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
              {dual.primaryFormatted}
            </span>
            {/* Moeda Convertida Equivalente (Secundária) */}
            <span className="text-sm sm:text-base font-mono-numbers font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25 shadow-sm">
              ≈ {dual.secondaryFormatted}
            </span>
            {/* Moeda Convertida Equivalente (Terciária - EUR) */}
            {dual.tertiaryFormatted && (
              <span className="text-sm sm:text-base font-mono-numbers font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/25 shadow-sm">
                ≈ {dual.tertiaryFormatted}
              </span>
            )}
          </div>

          {/* Taxa de câmbio de referência visível */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-numbers">
            <span className="font-semibold text-slate-300">Taxa de Câmbio de Referência:</span>
            <span className="text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {refRate}
            </span>
          </div>
        </div>

        {/* Variação Diária e Data/Hora da Cotação */}
        <div className="flex flex-col md:items-end space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Desempenho Diário
          </span>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold font-mono-numbers text-sm sm:text-base border shadow-sm ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {isPositive ? '+' : ''}
              {asset.changeValue.toFixed(2)} ({isPositive ? '+' : ''}
              {asset.change24h.toFixed(2)}%)
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Sincronizado hoje às <strong className="text-slate-200">{nowFormatted}</strong> (Horário de Brasília)
          </div>
        </div>
      </div>

      {/* 3. Motor Gráfico Avançado (Motor Gráfico D3 v7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Motor Gráfico D3 v7 • Análise Técnica Interativa
            </h2>
          </div>
        </div>

        {/* D3 v7 Chart Surface */}
        <D3AdvancedChart
          asset={asset}
          comparisonAssets={assets}
          initialTimeframe="1M"
          height={380}
        />
      </div>

      {/* 4. Indicadores de Mercado & Estatísticas Chave (Grid em Blocos) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            Indicadores de Mercado & Estatísticas Chave
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Abertura */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Abertura</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-white">
              {asset.currency === 'BRL' ? 'R$' : '$'} {meta.openPrice.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono-numbers text-emerald-400/90 font-medium">
              {asset.currency === 'BRL' ? `≈ $ ${(meta.openPrice / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(meta.openPrice * universalRates.BRL).toFixed(2)}`}
            </p>
            <span className="text-[9px] text-slate-500 font-medium block">Preço na abertura do pregão</span>
          </div>

          {/* 2. Máxima do Dia */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Máxima do Dia</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-emerald-400">
              {asset.currency === 'BRL' ? 'R$' : '$'} {asset.high24h.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono-numbers text-emerald-400/90 font-medium">
              {asset.currency === 'BRL' ? `≈ $ ${(asset.high24h / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(asset.high24h * universalRates.BRL).toFixed(2)}`}
            </p>
            <span className="text-[9px] text-slate-500 font-medium block">Pico nas últimas 24h</span>
          </div>

          {/* 3. Mínima do Dia */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Mínima do Dia</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-rose-400">
              {asset.currency === 'BRL' ? 'R$' : '$'} {asset.low24h.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono-numbers text-rose-300/90 font-medium">
              {asset.currency === 'BRL' ? `≈ $ ${(asset.low24h / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(asset.low24h * universalRates.BRL).toFixed(2)}`}
            </p>
            <span className="text-[9px] text-slate-500 font-medium block">Vale nas últimas 24h</span>
          </div>

          {/* 4. Volume Negociado */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Volume Negociado</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-white">
              {asset.volume}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Liquidez de transações</span>
          </div>

          {/* 5. Máx 52 Semanas */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Máx. 52 Semanas</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-emerald-300">
              {asset.currency === 'BRL' ? 'R$' : '$'} {meta.week52High.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono-numbers text-emerald-400/90 font-medium">
              {asset.currency === 'BRL' ? `≈ $ ${(meta.week52High / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(meta.week52High * universalRates.BRL).toFixed(2)}`}
            </p>
            <span className="text-[9px] text-slate-500 font-medium block">Topo anual histórico</span>
          </div>

          {/* 6. Mín 52 Semanas */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Mín. 52 Semanas</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-rose-300">
              {asset.currency === 'BRL' ? 'R$' : '$'} {meta.week52Low.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono-numbers text-rose-300/90 font-medium">
              {asset.currency === 'BRL' ? `≈ $ ${(meta.week52Low / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(meta.week52Low * universalRates.BRL).toFixed(2)}`}
            </p>
            <span className="text-[9px] text-slate-500 font-medium block">Fundo anual histórico</span>
          </div>

          {/* 7. P/L (Preço / Lucro) */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">P/L (Preço / Lucro)</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-sky-400">
              {meta.peRatioDisplay}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Múltiplo de Valuation</span>
          </div>

          {/* 8. Dividend Yield (DY) */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Dividend Yield (DY)</span>
            <p className="text-base sm:text-lg font-bold font-mono-numbers text-amber-400">
              {meta.dividendYieldDisplay}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Rendimento anual de proventos</span>
          </div>
        </div>
      </div>

      {/* 5. Módulo de Diagnóstico do Ativo com Inteligência Artificial */}
      <div className="bg-gradient-to-br from-[#0c172a] via-[#091120] to-[#060c17] border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Diagnóstico do Ativo com Inteligência Artificial</span>
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  DinhEuro AI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Análise quantitativa de liquidez, suporte, resistência e fatores de risco em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Resumo do Cenário */}
        <div className="bg-[#050b14]/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Resumo do Cenário & Níveis Críticos</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {meta.aiDiagnosis.scenarioSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Suporte Imediato</span>
              <span className="text-sm font-bold font-mono-numbers text-rose-400">
                {asset.currency === 'BRL' ? 'R$' : '$'} {meta.aiDiagnosis.supportLevel.toFixed(2)}
              </span>
              <span className="text-[10px] font-mono-numbers text-slate-400 block">
                {asset.currency === 'BRL' ? `≈ $ ${(meta.aiDiagnosis.supportLevel / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(meta.aiDiagnosis.supportLevel * universalRates.BRL).toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Resistência Técnica</span>
              <span className="text-sm font-bold font-mono-numbers text-emerald-400">
                {asset.currency === 'BRL' ? 'R$' : '$'} {meta.aiDiagnosis.resistanceLevel.toFixed(2)}
              </span>
              <span className="text-[10px] font-mono-numbers text-slate-400 block">
                {asset.currency === 'BRL' ? `≈ $ ${(meta.aiDiagnosis.resistanceLevel / universalRates.BRL).toFixed(2)}` : `≈ R$ ${(meta.aiDiagnosis.resistanceLevel * universalRates.BRL).toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Liquidez & Giro</span>
              <span className="text-xs text-slate-300 font-medium block">
                {meta.aiDiagnosis.liquidityAnalysis}
              </span>
            </div>
          </div>
        </div>

        {/* Pontos Fortes e Fatores de Risco (Duas Colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pontos Fortes & Oportunidades */}
          <div className="bg-[#07111e]/90 border border-emerald-500/25 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pontos Fortes & Oportunidades</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {meta.aiDiagnosis.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fatores de Risco & Atenção */}
          <div className="bg-[#07111e]/90 border border-amber-500/25 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Fatores de Risco & Atenção</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {meta.aiDiagnosis.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 6. Perfil Institucional */}
      <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            Perfil Institucional & Governança
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Natureza Jurídica / Tipo</span>
            <p className="text-slate-200 font-semibold">{meta.institutionalProfile.nature}</p>
          </div>

          <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Setor de Atuação</span>
            <p className="text-slate-200 font-semibold">{meta.institutionalProfile.sector}</p>
          </div>

          <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Segmento / Listagem</span>
            <p className="text-slate-200 font-semibold">{meta.institutionalProfile.segment}</p>
          </div>

          <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Benchmark Primário</span>
            <p className="text-slate-200 font-semibold">{meta.institutionalProfile.benchmark}</p>
          </div>

          {meta.institutionalProfile.governance && (
            <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Governança Corporativa</span>
              <p className="text-slate-200 font-semibold">{meta.institutionalProfile.governance}</p>
            </div>
          )}

          {meta.institutionalProfile.foundation && (
            <div className="bg-[#070e1b] rounded-xl p-3.5 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Ano de Fundação</span>
              <p className="text-slate-200 font-semibold">{meta.institutionalProfile.foundation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Toast Notification when added to portfolio */}
      {portfolioToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{asset.symbol} adicionado ao seu Portfólio com sucesso!</span>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Criar Alerta de Preço</span>
            </div>
            <p className="text-xs text-slate-300">
              Receba notificação instantânea quando <strong>{asset.symbol}</strong> atingir o patamar desejado.
            </p>
            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Preço Alvo ({asset.currency}):</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono-numbers focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-sky-500 text-slate-950 rounded-xl hover:bg-sky-400 transition"
                >
                  Salvar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
