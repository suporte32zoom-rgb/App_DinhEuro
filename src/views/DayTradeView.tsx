import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ShieldCheck,
  RotateCcw,
  Lock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Square,
  SlidersHorizontal,
  Key,
  Flame,
  ArrowRightLeft,
  ChevronDown,
  Home,
  Globe,
  BarChart3,
  FileText,
  Briefcase,
  Sparkles,
  Newspaper,
  Bell,
  Cpu,
  Target,
  PlayCircle,
  Settings,
  HelpCircle,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useMarket, NavigationTab } from '../context/MarketContext';
import { formatCurrencyValue } from '../utils/finance';
import { MarketAsset } from '../services/marketData';

export interface DayTradePosition {
  id: string;
  symbol: string;
  name: string;
  side: 'BUY' | 'SELL';
  contracts: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

export interface DayTradeClosedTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  contracts: number;
  entryPrice: number;
  exitPrice: number;
  pnlBrl: number;
  pnlUsd: number;
  closeTime: string;
}

export interface BookOffer {
  price: number;
  bidQty: number;
  askQty: number;
  bidVolPct: number;
  askVolPct: number;
  isPoc?: boolean;
}

export interface TradeTapeItem {
  id: string;
  time: string;
  price: number;
  qty: number;
  buyerBroker: string;
  sellerBroker: string;
  aggressor: 'BUY' | 'SELL';
  isLargeTrade?: boolean;
}

const BROKERS_POOL = [
  'UBS',
  'Morgan Stanley',
  'BTG Pactual',
  'XP Investimentos',
  'Itaú BBA',
  'Bradesco',
  'Goldman Sachs',
  'Merrill Lynch',
  'Genial',
  'Clear',
];

export const DayTradeView: React.FC = () => {
  const { assets, news, universalRates, setActiveTab, openAssetDetail } = useMarket();

  // Curated list of high-liquidity assets for Day Trading
  const dayTradeAssets = useMemo(() => {
    const customList = [
      {
        id: 'win_fut',
        symbol: 'WINFUT',
        name: 'Mini Índice B3 Futuro',
        category: 'indices',
        price: 132450,
        currency: 'BRL',
        change24h: 0.68,
        changeValue: 890,
        high24h: 133100,
        low24h: 131800,
        volume: '18.4B',
        sparkline: [131900, 132100, 132300, 132450],
        flag: '🇧🇷',
        tickSize: 5,
        tickValue: 1.0, // 5 pts = R$ 1.00 por contrato
        type: 'Futuros',
      },
      {
        id: 'wdo_fut',
        symbol: 'WDOFUT',
        name: 'Mini Dólar B3 Futuro',
        category: 'forex',
        price: 5482.5,
        currency: 'BRL',
        change24h: -0.32,
        changeValue: -17.5,
        high24h: 5510.0,
        low24h: 5468.0,
        volume: '12.8B',
        sparkline: [5505, 5495, 5488, 5482.5],
        flag: '🇧🇷',
        tickSize: 0.5,
        tickValue: 5.0, // 0.5 pt = R$ 5.00
        type: 'Futuros',
      },
      ...assets.map((a) => ({
        ...a,
        type:
          a.category === 'crypto'
            ? 'Cripto'
            : a.category === 'forex'
            ? 'Forex'
            : a.category === 'stocks_us'
            ? 'BDRs'
            : 'Ações',
      })),
    ];
    return customList as (MarketAsset & { tickSize?: number; tickValue?: number; type: string })[];
  }, [assets]);

  // Selected Active Asset
  const [selectedSymbol, setSelectedSymbol] = useState<string>('WINFUT');
  const currentAsset = dayTradeAssets.find((a) => a.symbol === selectedSymbol) || dayTradeAssets[0];

  // Active Main Center Tab
  const [activeCenterTab, setActiveCenterTab] = useState<'chart' | 'tape' | 'book' | 'indicators' | 'strategies'>('chart');

  // Timeframe for Intraday Chart (1m, 5m, 15m, 1h, 1D)
  const [chartInterval, setChartInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('5m');

  // Indicator Toggles
  const [showMA9, setShowMA9] = useState<boolean>(true);
  const [showMA21, setShowMA21] = useState<boolean>(true);
  const [showMA200, setShowMA200] = useState<boolean>(true);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Market Watch Tab in Right Column (Ações, Futuros, Forex, Cripto, BDRs)
  const [marketWatchCategory, setMarketWatchCategory] = useState<'Todos' | 'Ações' | 'Futuros' | 'Forex' | 'Cripto' | 'BDRs'>('Todos');
  const [marketWatchSearch, setMarketWatchSearch] = useState<string>('');

  // Mode Toggle (Simulado vs Real)
  const [operationMode, setOperationMode] = useState<'simulated' | 'real'>('simulated');
  const [showRealBrokerModal, setShowRealBrokerModal] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Risk Management State
  const [dailyProfitGoal, setDailyProfitGoal] = useState<number>(2000); // R$ 2.000
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000); // R$ 1.000
  const [isRiskLocked, setIsRiskLocked] = useState<boolean>(false);

  // Paper Trading Account
  const [accountBalance, setAccountBalance] = useState<number>(100000); // R$ 100.000,00
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [positions, setPositions] = useState<DayTradePosition[]>([]);
  const [closedTrades, setClosedTrades] = useState<DayTradeClosedTrade[]>([]);
  const [sessionStartTime] = useState<Date>(new Date(Date.now() - 4 * 3600 * 1000 - 32 * 60 * 1000));
  const [sessionTimer, setSessionTimer] = useState<string>('04h 32m 18s');

  // Order Ticket State
  const [orderTicketTab, setOrderTicketTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [contracts, setContracts] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(currentAsset.price);
  const [useStopLoss, setUseStopLoss] = useState<boolean>(true);
  const [stopLossOffset, setStopLossOffset] = useState<number>(150);
  const [useTakeProfit, setUseTakeProfit] = useState<boolean>(true);
  const [takeProfitOffset, setTakeProfitOffset] = useState<number>(300);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Live price & tick state
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(currentAsset.price);

  // Session elapsed timer update
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setSessionTimer(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [sessionStartTime]);

  // Synchronize price when asset changes
  useEffect(() => {
    setCurrentMarketPrice(currentAsset.price);
    setLimitPrice(currentAsset.price);
  }, [currentAsset]);

  // Floating P&L Calculation
  const floatingPnlBrl = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const isWin = pos.symbol === 'WINFUT' || pos.symbol === 'WIN$';
      const isWdo = pos.symbol === 'WDOFUT' || pos.symbol === 'WDO$';
      const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;

      let tradeVal = 0;
      if (isWin) {
        tradeVal = diff * 0.2 * pos.contracts;
      } else if (isWdo) {
        tradeVal = diff * 10 * pos.contracts;
      } else {
        tradeVal = diff * pos.contracts;
      }
      return acc + tradeVal;
    }, 0);
  }, [positions, currentMarketPrice]);

  const floatingPnlUsd = floatingPnlBrl / (universalRates.BRL || 5.48);
  const totalDayPnl = realizedPnl + floatingPnlBrl;
  const returnPercentage = ((totalDayPnl / 100000) * 100).toFixed(2);

  // Risk lock evaluation
  useEffect(() => {
    if (totalDayPnl <= -Math.abs(dailyLossLimit)) {
      if (!isRiskLocked) {
        setIsRiskLocked(true);
        if (positions.length > 0) {
          handleCloseAllPositions('Limite diário de perda atingido! Trava de risco institucional acionada.');
        }
      }
    }
  }, [totalDayPnl, dailyLossLimit, isRiskLocked, positions]);

  // Simulated DOM Book and Times & Trades
  const [bookOffers, setBookOffers] = useState<BookOffer[]>([]);
  const [timesAndTrades, setTimesAndTrades] = useState<TradeTapeItem[]>([]);

  useEffect(() => {
    const step = currentAsset.symbol.includes('WIN') ? 5 : currentAsset.symbol.includes('WDO') ? 0.5 : 0.05;
    const base = currentMarketPrice;

    const offers: BookOffer[] = [];
    for (let i = 8; i >= -8; i--) {
      if (i === 0) continue;
      const p = Number((base + i * step).toFixed(step < 1 ? 2 : 0));
      const bQty = i < 0 ? Math.floor(Math.random() * 400 + 40) : 0;
      const aQty = i > 0 ? Math.floor(Math.random() * 400 + 40) : 0;
      offers.push({
        price: p,
        bidQty: bQty,
        askQty: aQty,
        bidVolPct: Math.min(100, Math.round((bQty / 500) * 100)),
        askVolPct: Math.min(100, Math.round((aQty / 500) * 100)),
        isPoc: i === -2,
      });
    }
    setBookOffers(offers);

    const initialTrades: TradeTapeItem[] = [];
    const now = Date.now();
    for (let i = 0; i < 15; i++) {
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const offset = (Math.random() - 0.5) * step * 2;
      const qty = Math.random() > 0.8 ? Math.floor(Math.random() * 70 + 30) : Math.floor(Math.random() * 20 + 2);
      initialTrades.push({
        id: `trade_${now}_${i}`,
        time: new Date(now - i * 1500).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: Number((base + offset).toFixed(step < 1 ? 2 : 0)),
        qty,
        buyerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        sellerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        aggressor: side,
        isLargeTrade: qty >= 40,
      });
    }
    setTimesAndTrades(initialTrades);
  }, [selectedSymbol, currentAsset]);

  // Live Jitter & Tape Stream
  useEffect(() => {
    const interval = setInterval(() => {
      const step = currentAsset.symbol.includes('WIN') ? 5 : currentAsset.symbol.includes('WDO') ? 0.5 : 0.05;
      const delta = (Math.random() - 0.49) * step;
      const newPrice = Number((currentMarketPrice + delta).toFixed(step < 1 ? 2 : 0));
      setCurrentMarketPrice(newPrice);

      const side: 'BUY' | 'SELL' = Math.random() > 0.48 ? 'BUY' : 'SELL';
      const qty = Math.random() > 0.82 ? Math.floor(Math.random() * 80 + 35) : Math.floor(Math.random() * 25 + 2);
      const newTrade: TradeTapeItem = {
        id: `tick_${Date.now()}_${Math.random()}`,
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: newPrice,
        qty,
        buyerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        sellerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        aggressor: side,
        isLargeTrade: qty >= 40,
      };

      setTimesAndTrades((prev) => [newTrade, ...prev.slice(0, 24)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [currentMarketPrice, currentAsset]);

  // Order Execution Functions
  const handleExecuteOrder = (side: 'BUY' | 'SELL') => {
    if (isRiskLocked) {
      setOrderNotification('❌ Trava de risco ativa! Limite de perda diário atingido.');
      setTimeout(() => setOrderNotification(null), 4000);
      return;
    }

    const price = orderType === 'MARKET' ? currentMarketPrice : limitPrice;

    const stopPrice = useStopLoss
      ? side === 'BUY'
        ? price - stopLossOffset
        : price + stopLossOffset
      : undefined;

    const takePrice = useTakeProfit
      ? side === 'BUY'
        ? price + takeProfitOffset
        : price - takeProfitOffset
      : undefined;

    const newPosition: DayTradePosition = {
      id: `pos_${Date.now()}`,
      symbol: currentAsset.symbol,
      name: currentAsset.name,
      side,
      contracts,
      entryPrice: price,
      currentPrice: price,
      stopLoss: stopPrice,
      takeProfit: takePrice,
      openTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setPositions((prev) => [...prev, newPosition]);
    setOrderNotification(
      `✓ Ordem de ${side === 'BUY' ? 'COMPRA' : 'VENDA'} executada: ${contracts}x ${currentAsset.symbol} a ${formatCurrencyValue(price, currentAsset.currency)}`
    );
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const isWin = pos.symbol === 'WINFUT' || pos.symbol === 'WIN$';
    const isWdo = pos.symbol === 'WDOFUT' || pos.symbol === 'WDO$';
    const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;

    let pnl = 0;
    if (isWin) {
      pnl = diff * 0.2 * pos.contracts;
    } else if (isWdo) {
      pnl = diff * 10 * pos.contracts;
    } else {
      pnl = diff * pos.contracts;
    }

    const closed: DayTradeClosedTrade = {
      id: pos.id,
      symbol: pos.symbol,
      side: pos.side,
      contracts: pos.contracts,
      entryPrice: pos.entryPrice,
      exitPrice: currentMarketPrice,
      pnlBrl: pnl,
      pnlUsd: pnl / (universalRates.BRL || 5.48),
      closeTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setClosedTrades((prev) => [closed, ...prev]);
    setRealizedPnl((prev) => prev + pnl);
    setAccountBalance((prev) => prev + pnl);
    setPositions((prev) => prev.filter((p) => p.id !== id));

    setOrderNotification(
      `Posição encerrada: ${pos.symbol} com resultado de ${pnl >= 0 ? '+' : ''}${formatCurrencyValue(pnl, 'BRL')}`
    );
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const handleCloseAllPositions = (reason?: string) => {
    if (positions.length === 0) return;

    let batchPnl = 0;
    const newClosed: DayTradeClosedTrade[] = [];

    positions.forEach((pos) => {
      const isWin = pos.symbol === 'WINFUT' || pos.symbol === 'WIN$';
      const isWdo = pos.symbol === 'WDOFUT' || pos.symbol === 'WDO$';
      const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;

      let pnl = 0;
      if (isWin) {
        pnl = diff * 0.2 * pos.contracts;
      } else if (isWdo) {
        pnl = diff * 10 * pos.contracts;
      } else {
        pnl = diff * pos.contracts;
      }
      batchPnl += pnl;

      newClosed.push({
        id: pos.id,
        symbol: pos.symbol,
        side: pos.side,
        contracts: pos.contracts,
        entryPrice: pos.entryPrice,
        exitPrice: currentMarketPrice,
        pnlBrl: pnl,
        pnlUsd: pnl / (universalRates.BRL || 5.48),
        closeTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    });

    setClosedTrades((prev) => [...newClosed, ...prev]);
    setRealizedPnl((prev) => prev + batchPnl);
    setAccountBalance((prev) => prev + batchPnl);
    setPositions([]);

    setOrderNotification(reason || `Todas as posições foram zeradas a mercado! P&L consolidado: ${batchPnl >= 0 ? '+' : ''}${formatCurrencyValue(batchPnl, 'BRL')}`);
    setTimeout(() => setOrderNotification(null), 3500);
  };

  const handleReversePosition = () => {
    if (positions.length === 0) return;
    const firstPos = positions[0];
    const newSide = firstPos.side === 'BUY' ? 'SELL' : 'BUY';
    const totalQty = firstPos.contracts;

    handleCloseAllPositions();
    setTimeout(() => {
      const newPos: DayTradePosition = {
        id: `pos_${Date.now()}`,
        symbol: currentAsset.symbol,
        name: currentAsset.name,
        side: newSide,
        contracts: totalQty,
        entryPrice: currentMarketPrice,
        currentPrice: currentMarketPrice,
        openTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setPositions([newPos]);
      setOrderNotification(`Inversão executada: Agora ${newSide === 'BUY' ? 'COMPRADO' : 'VENDIDO'} em ${totalQty}x ${currentAsset.symbol}`);
      setTimeout(() => setOrderNotification(null), 3000);
    }, 200);
  };

  const handleResetSimulator = () => {
    setAccountBalance(100000);
    setRealizedPnl(0);
    setPositions([]);
    setClosedTrades([]);
    setIsRiskLocked(false);
    setOrderNotification('Simulador reiniciado com sucesso! Saldo restaurado para R$ 100.000,00.');
    setTimeout(() => setOrderNotification(null), 3000);
  };

  // Performance calculation
  const totalTradesCount = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => t.pnlBrl > 0).length;
  const losingTrades = totalTradesCount - winningTrades;
  const winRate = totalTradesCount > 0 ? Math.round((winningTrades / totalTradesCount) * 100) : 75;

  // Global top continuous tickers list
  const globalTickers = useMemo(() => {
    return [
      {
        symbol: 'IBOVESPA',
        label: 'IBOV',
        price: '131.840',
        change: +0.72,
        spark: [130900, 131200, 131500, 131840],
      },
      {
        symbol: 'USD/BRL',
        label: 'DÓLAR',
        price: 'R$ 5,482',
        change: -0.35,
        spark: [5.52, 5.50, 5.49, 5.482],
      },
      {
        symbol: 'EUR/BRL',
        label: 'EURO',
        price: 'R$ 6,154',
        change: +0.21,
        spark: [6.12, 6.13, 6.14, 6.154],
      },
      {
        symbol: 'S&P 500',
        label: 'S&P 500',
        price: '5.885,2',
        change: +0.48,
        spark: [5840, 5860, 5875, 5885],
      },
      {
        symbol: 'BTC/USD',
        label: 'BTC/USD',
        price: '$ 87.950',
        change: +1.84,
        spark: [85200, 86400, 87100, 87950],
      },
      {
        symbol: 'PETR4',
        label: 'PETR4',
        price: 'R$ 38,65',
        change: +1.15,
        spark: [38.1, 38.3, 38.5, 38.65],
      },
      {
        symbol: 'VALE3',
        label: 'VALE3',
        price: 'R$ 62,40',
        change: -0.42,
        spark: [62.9, 62.7, 62.5, 62.4],
      },
    ];
  }, []);

  // Filtered market watch items
  const filteredMarketWatch = useMemo(() => {
    return dayTradeAssets.filter((a) => {
      if (marketWatchCategory !== 'Todos' && a.type !== marketWatchCategory) return false;
      if (marketWatchSearch.trim()) {
        const query = marketWatchSearch.toLowerCase();
        return a.symbol.toLowerCase().includes(query) || a.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [dayTradeAssets, marketWatchCategory, marketWatchSearch]);

  // Left sidebar menu items definition
  const sidebarItems = [
    { id: 'dashboard', label: 'Início', icon: Home, action: () => setActiveTab('dashboard') },
    { id: 'mercados', label: 'Mercados', icon: Globe, action: () => setActiveTab('mercados') },
    { id: 'graficos', label: 'Gráficos Avançados', icon: BarChart3, action: () => setActiveTab('graficos') },
    { id: 'ordens', label: 'Ordens & Boleta', icon: FileText, action: () => setActiveCenterTab('book') },
    { id: 'posicoes', label: 'Minhas Posições', icon: Activity, action: () => {} },
    { id: 'carteira', label: 'Carteira', icon: Briefcase, action: () => setActiveTab('carteiras') },
    { id: 'analises', label: 'Análises & Diagnóstico', icon: Sparkles, action: () => setActiveCenterTab('indicators') },
    { id: 'noticias', label: 'Notícias do Mercado', icon: Newspaper, action: () => setActiveTab('noticias') },
    { id: 'alertas', label: 'Alertas de Preço', icon: Bell, action: () => setShowAlertModal(true) },
    { id: 'estrategias', label: 'Estratégias Scalping', icon: Target, action: () => setActiveCenterTab('strategies') },
    { id: 'simulador', label: 'Resetar Simulador', icon: PlayCircle, action: handleResetSimulator },
    { id: 'configuracoes', label: 'Gestão de Risco', icon: Settings, action: () => setShowRiskModal(true) },
    { id: 'ajuda', label: 'Ajuda & Teclas de Atalho', icon: HelpCircle, action: () => setShowHelpModal(true) },
  ];

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#070d18] text-slate-100 select-none overflow-hidden text-xs">
      {/* =========================================================================
          1. TOP CONTINUOUS GLOBAL TICKERS MARQUEE (IBOV, DÓLAR, EURO, S&P 500, BTC)
         ========================================================================= */}
      <div className="bg-[#050a14] border-b border-slate-800/90 px-2 py-1 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0 text-[11px] font-mono-numbers">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-bold uppercase text-[10px] tracking-wider pr-2 border-r border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Feed Global Ao Vivo:</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar flex-nowrap py-0.5">
          {globalTickers.map((t) => {
            const isPos = t.change >= 0;
            return (
              <div
                key={t.symbol}
                onClick={() => {
                  const match = dayTradeAssets.find((a) => a.symbol === t.symbol);
                  if (match) setSelectedSymbol(match.symbol);
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition cursor-pointer shrink-0"
              >
                <span className="font-bold text-slate-200 text-[10px]">{t.label}</span>
                <span className="font-black text-white text-[11px]">{t.price}</span>
                <span
                  className={`text-[10px] font-bold flex items-center ${
                    isPos ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {t.change.toFixed(2)}%
                </span>
                {/* Micro SVG Sparkline */}
                <svg className="w-10 h-3 overflow-visible shrink-0" viewBox="0 0 40 12">
                  <polyline
                    fill="none"
                    stroke={isPos ? '#10b981' : '#ef4444'}
                    strokeWidth="1.2"
                    points="0,8 12,4 24,9 40,2"
                  />
                </svg>
              </div>
            );
          })}
        </div>

        {/* Operation Mode Quick Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-800 text-[10px]">
          <div className="flex items-center bg-[#09111e] p-0.5 rounded border border-slate-800 font-bold">
            <button
              onClick={() => setOperationMode('simulated')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                operationMode === 'simulated' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulador Paper
            </button>
            <button
              onClick={() => {
                setOperationMode('real');
                setShowRealBrokerModal(true);
              }}
              className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                operationMode === 'real' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-2.5 h-2.5" /> Real API
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {orderNotification && (
        <div className="bg-emerald-950/95 border-b border-emerald-500/70 text-emerald-200 px-3 py-1 text-xs flex items-center justify-between shadow-lg shrink-0">
          <span className="font-semibold">{orderNotification}</span>
          <button onClick={() => setOrderNotification(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. MAIN TRADING WORKSPACE BODY: (SIDEBAR + CENTER + RIGHT COLUMN)
         ========================================================================= */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* =======================================================================
            2A. SLIM LEFT SIDEBAR MENU (Icons with Institutional Seal)
           ======================================================================= */}
        <aside className="w-11 sm:w-12 bg-[#050a14] border-r border-slate-800/90 flex flex-col items-center justify-between py-2 shrink-0 select-none z-10">
          <div className="flex flex-col items-center gap-1 w-full">
            {sidebarItems.slice(0, 10).map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  title={item.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800/70 transition cursor-pointer group relative"
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Lower tools & DinhEuro Institutional Seal */}
          <div className="flex flex-col items-center gap-1 w-full pt-1 border-t border-slate-800/80">
            {sidebarItems.slice(10).map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  title={item.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800/70 transition cursor-pointer"
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}

            {/* DinhEuro PRO Institutional Badge */}
            <div
              onClick={() => setActiveTab('sobre')}
              title="DinhEuro Pro Terminal • Conectividade B3"
              className="mt-1 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md shadow-emerald-950 flex items-center justify-center">
                <span className="text-[9px] font-black text-slate-950">D€</span>
              </div>
              <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">PRO</span>
            </div>
          </div>
        </aside>

        {/* =======================================================================
            2B. CENTRAL WORKSPACE: (TOP TABS & CONTROLS + CHART/VIEW + BOTTOM DOCK)
           ======================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Top Asset & Function Tabs Header Strip */}
          <div className="bg-[#09111e] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap shrink-0">
            {/* Left: Asset Select Dropdown & Current Price */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  aria-label="Selecionar ativo"
                  className="bg-[#060c18] border border-slate-700 hover:border-emerald-500 rounded px-2 pr-6 py-1 text-xs font-black text-white font-mono-numbers outline-none cursor-pointer"
                >
                  <optgroup label="Futuros B3">
                    <option value="WINFUT">WINFUT • Mini Índice B3</option>
                    <option value="WDOFUT">WDOFUT • Mini Dólar B3</option>
                  </optgroup>
                  <optgroup label="Ações B3">
                    <option value="PETR4">PETR4 • Petrobras PN</option>
                    <option value="VALE3">VALE3 • Vale ON</option>
                    <option value="ITUB4">ITUB4 • Itaú Unibanco</option>
                  </optgroup>
                  <optgroup label="Cripto & Global">
                    <option value="BTC/USD">BTC/USD • Bitcoin</option>
                    <option value="ETH/USD">ETH/USD • Ethereum</option>
                    <option value="AAPL">AAPL • Apple</option>
                    <option value="NVDA">NVDA • Nvidia</option>
                  </optgroup>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Price & Variation */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800 font-mono-numbers">
                <span className="text-base font-black text-white">
                  {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    currentAsset.change24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {currentAsset.change24h >= 0 ? '+' : ''}
                  {currentAsset.change24h}%
                </span>
                <span className="text-[10px] text-slate-500 hidden xl:inline">
                  Mín: {currentAsset.low24h} | Máx: {currentAsset.high24h} | Vol: {currentAsset.volume}
                </span>
              </div>
            </div>

            {/* Center: Functional Terminal Tabs */}
            <div className="flex items-center gap-1 bg-[#060c18] p-0.5 rounded border border-slate-800 text-[11px] font-bold">
              {[
                { id: 'chart', label: 'Gráfico' },
                { id: 'tape', label: 'Tape Reading' },
                { id: 'book', label: 'Book de Ofertas' },
                { id: 'indicators', label: 'Indicadores' },
                { id: 'strategies', label: 'Estratégias' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCenterTab(tab.id as any)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    activeCenterTab === tab.id
                      ? 'bg-slate-800 text-emerald-400 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: Timeframes & Indicator Badges */}
            <div className="flex items-center gap-2">
              {/* Timeframes */}
              <div className="flex items-center bg-[#060c18] p-0.5 rounded border border-slate-800 text-[10px] font-bold">
                {(['1m', '5m', '15m', '1h', '1D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartInterval(tf)}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      chartInterval === tf ? 'bg-slate-800 text-emerald-400 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Indicator Toggles */}
              <div className="hidden lg:flex items-center gap-1 text-[9px] font-mono-numbers">
                <button
                  onClick={() => setShowMA9(!showMA9)}
                  className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                    showMA9 ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold' : 'text-slate-500 border-slate-800'
                  }`}
                >
                  MA 9
                </button>
                <button
                  onClick={() => setShowMA21(!showMA21)}
                  className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                    showMA21 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' : 'text-slate-500 border-slate-800'
                  }`}
                >
                  MA 21
                </button>
                <button
                  onClick={() => setShowMA200(!showMA200)}
                  className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                    showMA200 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'text-slate-500 border-slate-800'
                  }`}
                >
                  MA 200
                </button>
                <button
                  onClick={() => setShowVWAP(!showVWAP)}
                  className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                    showVWAP ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 font-bold' : 'text-slate-500 border-slate-800'
                  }`}
                >
                  VWAP
                </button>
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                    showVolume ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'text-slate-500 border-slate-800'
                  }`}
                >
                  Vol
                </button>
              </div>
            </div>
          </div>

          {/* Central Active View Area (Flex-1) */}
          <div className="flex-1 min-h-0 relative bg-[#060c18] overflow-hidden p-1.5">
            {activeCenterTab === 'chart' && (
              <div className="w-full h-full relative rounded border border-slate-800/80 bg-[#060c18] overflow-hidden flex flex-col">
                <svg className="w-full h-full flex-1" viewBox="0 0 700 280" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="0" y1="50" x2="700" y2="50" stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="150" x2="700" y2="150" stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="200" x2="700" y2="200" stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />

                  {/* Candlesticks & Volume Histogram */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const x = 12 + i * 19.4;
                    const isUp = i % 2 === 0 || i % 5 === 0;
                    const open = 115 + Math.sin(i * 0.35) * 45;
                    const close = isUp ? open - 18 : open + 16;
                    const high = Math.min(open, close) - 12;
                    const low = Math.max(open, close) + 12;
                    const color = isUp ? '#10B981' : '#EF4444';
                    const volHeight = Math.abs(Math.sin(i * 0.5)) * 38 + 8;

                    return (
                      <g key={i}>
                        {/* Volume bar at base */}
                        {showVolume && (
                          <rect
                            x={x}
                            y={275 - volHeight}
                            width="8.5"
                            height={volHeight}
                            fill={color}
                            opacity="0.35"
                            rx="0.5"
                          />
                        )}
                        {/* Wick */}
                        <line x1={x + 4.2} y1={high} x2={x + 4.2} y2={low} stroke={color} strokeWidth="1.2" />
                        {/* Candle body */}
                        <rect
                          x={x}
                          y={Math.min(open, close)}
                          width="8.5"
                          height={Math.max(3, Math.abs(close - open))}
                          fill={color}
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                  {/* MA 9 Line (Cyan) */}
                  {showMA9 && (
                    <path
                      d="M 12 118 Q 180 85, 360 98 T 685 92"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                      opacity="0.95"
                    />
                  )}

                  {/* MA 21 Line (Purple) */}
                  {showMA21 && (
                    <path
                      d="M 12 126 Q 200 100, 380 112 T 685 106"
                      fill="none"
                      stroke="#C084FC"
                      strokeWidth="1.8"
                      opacity="0.9"
                    />
                  )}

                  {/* MA 200 Line (Amber) */}
                  {showMA200 && (
                    <path
                      d="M 12 142 Q 220 130, 420 128 T 685 120"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.2"
                      opacity="0.85"
                    />
                  )}

                  {/* VWAP Line (Magenta Dash) */}
                  {showVWAP && (
                    <path
                      d="M 12 112 Q 170 92, 340 104 T 685 98"
                      fill="none"
                      stroke="#E879F9"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                  )}

                  {/* Active Positions Overlay Line */}
                  {positions.length > 0 && (
                    <g>
                      <line x1="0" y1="95" x2="700" y2="95" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="5 3" />
                      <text x="8" y="90" fill="#60A5FA" fontSize="9" fontWeight="bold">
                        Preço Médio ({positions[0].side}): {formatCurrencyValue(positions[0].entryPrice, currentAsset.currency)}
                      </text>
                    </g>
                  )}
                </svg>

                {/* Overlaid Indicators Legend */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[9px] font-mono-numbers">
                  {showMA9 && <span className="text-sky-400 bg-sky-950/70 px-1 py-0.2 rounded border border-sky-500/30">MA 9: {formatCurrencyValue(currentMarketPrice * 1.001, currentAsset.currency)}</span>}
                  {showMA21 && <span className="text-purple-400 bg-purple-950/70 px-1 py-0.2 rounded border border-purple-500/30">MA 21: {formatCurrencyValue(currentMarketPrice * 0.998, currentAsset.currency)}</span>}
                  {showMA200 && <span className="text-amber-400 bg-amber-950/70 px-1 py-0.2 rounded border border-amber-500/30">MA 200: {formatCurrencyValue(currentMarketPrice * 0.985, currentAsset.currency)}</span>}
                  {showVWAP && <span className="text-fuchsia-400 bg-fuchsia-950/70 px-1 py-0.2 rounded border border-fuchsia-500/30">VWAP: {formatCurrencyValue(currentMarketPrice * 0.999, currentAsset.currency)}</span>}
                </div>
              </div>
            )}

            {/* Other functional views inside central pane */}
            {activeCenterTab === 'tape' && (
              <div className="w-full h-full flex flex-col rounded border border-slate-800 bg-[#070e1b] p-2 overflow-hidden">
                <span className="font-bold text-white text-[11px] mb-1">Fita de Negócios Contínua (Times & Trades)</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 font-mono-numbers text-[10px]">
                  {timesAndTrades.map((t) => (
                    <div key={t.id} className="grid grid-cols-5 py-0.5 px-1 rounded hover:bg-slate-800/40">
                      <span className="text-slate-400">{t.time}</span>
                      <span className={t.aggressor === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{t.price}</span>
                      <span className="text-white font-bold">{t.qty} lotes</span>
                      <span className="text-sky-300">{t.buyerBroker}</span>
                      <span className="text-rose-300">{t.sellerBroker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeCenterTab === 'book' && (
              <div className="w-full h-full flex flex-col rounded border border-slate-800 bg-[#070e1b] p-2 overflow-hidden">
                <span className="font-bold text-white text-[11px] mb-1">Livro de Ofertas Vertical (DOM Ladder)</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 font-mono-numbers text-[10px]">
                  {bookOffers.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-3 py-0.5 px-2 rounded hover:bg-slate-800/40">
                      <span className="text-sky-400 font-bold">{b.bidQty > 0 ? b.bidQty : ''}</span>
                      <span className="text-center font-bold text-white">{b.price}</span>
                      <span className="text-right text-rose-400 font-bold">{b.askQty > 0 ? b.askQty : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeCenterTab === 'indicators' && (
              <div className="w-full h-full flex flex-col rounded border border-slate-800 bg-[#070e1b] p-3 overflow-y-auto no-scrollbar space-y-2">
                <h4 className="font-bold text-white text-xs">Diagnóstico Técnico Automatizado</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">IFR / RSI (14)</span>
                    <strong className="text-emerald-400 font-bold font-mono-numbers">56.4 (Neutro-Alta)</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MACD (12, 26, 9)</span>
                    <strong className="text-emerald-400 font-bold font-mono-numbers">+142.0 (Compra)</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Estocástico Lento</span>
                    <strong className="text-amber-400 font-bold font-mono-numbers">68.2 (Sobrecompra)</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Bandas de Bollinger</span>
                    <strong className="text-sky-400 font-bold font-mono-numbers">Dentro da Banda</strong>
                  </div>
                </div>
              </div>
            )}

            {activeCenterTab === 'strategies' && (
              <div className="w-full h-full flex flex-col rounded border border-slate-800 bg-[#070e1b] p-3 overflow-y-auto no-scrollbar space-y-2 text-xs">
                <h4 className="font-bold text-white">Estratégias de Scalping e Rompimento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400 block">1. Pullback na VWAP</span>
                    <p className="text-[11px] text-slate-400">Entrada na retração após toque e rejeição da linha média ponderada com confirmação de fluxo comprador.</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-sky-400 block">2. Cruzamento 9 x 21</span>
                    <p className="text-[11px] text-slate-400">Gatilho de compra quando a MA 9 cruza para cima da MA 21 com candle fechado acima do patamar.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              2C. BOTTOM MONITORING & PERFORMANCE DOCK (Minhas Posições + Performance + Notícias)
             ===================================================================== */}
          <div className="h-44 sm:h-48 border-t border-slate-800 bg-[#070d18] grid grid-cols-12 gap-1.5 p-1.5 shrink-0 overflow-hidden">
            {/* Box 1: Minhas Posições (5 Cols) */}
            <div className="col-span-12 lg:col-span-5 bg-[#09111e] border border-slate-800 rounded p-1.5 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1 shrink-0 text-xs">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Minhas Posições ({positions.length})
                </span>
                {positions.length > 0 && (
                  <button
                    onClick={() => handleCloseAllPositions()}
                    className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold"
                  >
                    Zerar Todas
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {positions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-[10px]">
                    Nenhuma posição aberta no momento.
                  </div>
                ) : (
                  <table className="w-full text-left text-[10px] font-mono-numbers">
                    <thead className="bg-[#060c18] text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-0.5 px-1">Ativo</th>
                        <th className="py-0.5 px-1">Lado</th>
                        <th className="py-0.5 px-1 text-right">Qtd</th>
                        <th className="py-0.5 px-1 text-right">Entrada</th>
                        <th className="py-0.5 px-1 text-right">Atual</th>
                        <th className="py-0.5 px-1 text-right">P&L</th>
                        <th className="py-0.5 px-1 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {positions.map((pos) => {
                        const isWin = pos.symbol.includes('WIN');
                        const isWdo = pos.symbol.includes('WDO');
                        const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;
                        let pnlBrl = isWin ? diff * 0.2 * pos.contracts : isWdo ? diff * 10 * pos.contracts : diff * pos.contracts;

                        return (
                          <tr key={pos.id} className="hover:bg-slate-800/40">
                            <td className="py-0.5 px-1 font-bold text-white">{pos.symbol}</td>
                            <td className="py-0.5 px-1">
                              <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${pos.side === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-0.5 px-1 text-right text-slate-200">{pos.contracts}</td>
                            <td className="py-0.5 px-1 text-right text-slate-400">{pos.entryPrice}</td>
                            <td className="py-0.5 px-1 text-right text-white font-bold">{currentMarketPrice}</td>
                            <td className={`py-0.5 px-1 text-right font-bold ${pnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {pnlBrl >= 0 ? '+' : ''}{formatCurrencyValue(pnlBrl, 'BRL')}
                            </td>
                            <td className="py-0.5 px-1 text-center">
                              <button
                                onClick={() => handleClosePosition(pos.id)}
                                className="px-1 py-0.2 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 text-[8px] font-bold transition"
                              >
                                Zerar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Box 2: Performance do Dia (Anel Win Rate + P&L + Cronômetro) (3.5 Cols) */}
            <div className="col-span-12 lg:col-span-4 bg-[#09111e] border border-slate-800 rounded p-2 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 shrink-0 text-xs">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" />
                  Performance do Dia
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {sessionTimer}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 flex-1 py-1">
                {/* SVG Progress Ring */}
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${winRate}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black font-mono-numbers text-white">{winRate}%</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold">Acerto</span>
                  </div>
                </div>

                {/* Performance Metrics Values */}
                <div className="space-y-1 font-mono-numbers text-[10px] flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Resultado Líquido:</span>
                    <strong className={`font-black text-xs ${totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalDayPnl >= 0 ? '+' : ''}{formatCurrencyValue(totalDayPnl, 'BRL')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rentabilidade Dia:</span>
                    <span className={`font-bold ${totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalDayPnl >= 0 ? '+' : ''}{returnPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[9px]">
                    <span>Trades: {winningTrades} Gain / {losingTrades} Loss</span>
                    <span>Total: {totalTradesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Notícias do Mercado (3.5 Cols) */}
            <div className="col-span-12 lg:col-span-3 bg-[#09111e] border border-slate-800 rounded p-1.5 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1 shrink-0 text-xs">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Newspaper className="w-3 h-3 text-sky-400" />
                  Notícias do Mercado
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">Tempo Real</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 text-[10px]">
                {news.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => setActiveTab('noticias')}
                    className="p-1 rounded bg-[#060c18] hover:bg-slate-800/60 border border-slate-800/60 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                      <span className="font-mono-numbers">{item.datetime ? item.datetime.split(' ')[1] || '14:32' : '14:32'}</span>
                      <span className="text-emerald-400 font-semibold">{item.category || 'Macro'}</span>
                    </div>
                    <p className="text-slate-300 font-medium line-clamp-1 text-[10px] leading-tight hover:text-white">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================================
            2D. RIGHT COLUMN: "MERCADO EM TEMPO REAL" + BOLETA DE EXECUÇÃO RÁPIDA
           ======================================================================= */}
        <div className="w-64 sm:w-72 bg-[#050a14] border-l border-slate-800/90 flex flex-col shrink-0 select-none overflow-hidden">
          {/* Upper Right: Mercado em Tempo Real */}
          <div className="h-56 flex flex-col border-b border-slate-800 p-2 overflow-hidden shrink-0">
            <div className="flex items-center justify-between pb-1 mb-1">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                Mercado em Tempo Real
              </span>
              <span className="text-[9px] text-slate-500 font-mono-numbers">{filteredMarketWatch.length} Ativos</span>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[9px] font-bold mb-1">
              {(['Todos', 'Ações', 'Futuros', 'Forex', 'Cripto', 'BDRs'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarketWatchCategory(cat)}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer shrink-0 ${
                    marketWatchCategory === cat
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative mb-1">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ativo..."
                value={marketWatchSearch}
                onChange={(e) => setMarketWatchSearch(e.target.value)}
                className="w-full bg-[#08111e] border border-slate-800 rounded pl-6 pr-2 py-0.5 text-[10px] text-white placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Market Watch Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 font-mono-numbers text-[10px]">
              {filteredMarketWatch.map((item) => {
                const isSelected = item.symbol === selectedSymbol;
                const isPos = item.change24h >= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`flex items-center justify-between px-1.5 py-1 rounded transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border border-emerald-500/40'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white block text-[10px]">{item.symbol}</span>
                      <span className="text-[8px] text-slate-500">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-[10px] block">
                        {item.price.toLocaleString('pt-BR', { minimumFractionDigits: item.tickSize && item.tickSize < 1 ? 2 : 0 })}
                      </span>
                      <span className={`text-[9px] font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{item.change24h}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lower Right: Boleta de Execução Rápida */}
          <div className="flex-1 min-h-0 bg-[#09111e] p-2.5 flex flex-col justify-between overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
                  Boleta de Execução Rápida
                </span>
                <span className="text-[9px] text-slate-400 font-mono-numbers font-semibold">
                  Spread: {currentAsset.symbol.includes('WIN') ? '5 pts' : '0.5 pt'}
                </span>
              </div>

              {/* Order Ticket Tabs (Compra / Venda) */}
              <div className="grid grid-cols-2 gap-1 bg-[#060c18] p-0.5 rounded border border-slate-800 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setOrderTicketTab('BUY')}
                  className={`py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
                    orderTicketTab === 'BUY'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" /> COMPRA
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTicketTab('SELL')}
                  className={`py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
                    orderTicketTab === 'SELL'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3 h-3" /> VENDA
                </button>
              </div>

              {/* Order Type (Mercado / Limitada) */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`py-1 rounded border transition cursor-pointer ${
                    orderType === 'MARKET'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  A Mercado
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`py-1 rounded border transition cursor-pointer ${
                    orderType === 'LIMIT'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-[#060c18] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Ordem Limitada
                </button>
              </div>

              {/* Quantity / Contratos */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Quantidade de Contratos:</span>
                  <span className="font-mono-numbers text-white font-bold">{contracts}x</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={contracts}
                    onChange={(e) => setContracts(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-[#060c18] border border-slate-700 rounded px-1.5 py-1 text-white font-mono-numbers text-xs font-bold outline-none text-center"
                  />
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {[1, 5, 10, 25, 50].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setContracts(q)}
                        className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                          contracts === q
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Limit Price if selected */}
              {orderType === 'LIMIT' && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400">Preço Limite:</span>
                  <input
                    type="number"
                    step={currentAsset.symbol.includes('WIN') ? 5 : 0.5}
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="w-full bg-[#060c18] border border-slate-700 rounded px-2 py-1 text-white font-mono-numbers text-xs font-bold outline-none"
                  />
                </div>
              )}

              {/* Stop Loss & Gain Offsets */}
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="bg-[#060c18] p-1 rounded border border-slate-800/80 flex items-center justify-between">
                  <label className="text-rose-400 font-bold flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useStopLoss}
                      onChange={(e) => setUseStopLoss(e.target.checked)}
                      className="accent-rose-500 cursor-pointer"
                    />
                    <span>SL</span>
                  </label>
                  {useStopLoss && (
                    <input
                      type="number"
                      value={stopLossOffset}
                      onChange={(e) => setStopLossOffset(Number(e.target.value))}
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-white font-mono-numbers text-right text-[10px]"
                    />
                  )}
                </div>

                <div className="bg-[#060c18] p-1 rounded border border-slate-800/80 flex items-center justify-between">
                  <label className="text-emerald-400 font-bold flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTakeProfit}
                      onChange={(e) => setUseTakeProfit(e.target.checked)}
                      className="accent-emerald-500 cursor-pointer"
                    />
                    <span>TP</span>
                  </label>
                  {useTakeProfit && (
                    <input
                      type="number"
                      value={takeProfitOffset}
                      onChange={(e) => setTakeProfitOffset(Number(e.target.value))}
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-white font-mono-numbers text-right text-[10px]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ACTION EXECUTION BUTTONS */}
            <div className="space-y-1.5 pt-1">
              {orderTicketTab === 'BUY' ? (
                <button
                  type="button"
                  onClick={() => handleExecuteOrder('BUY')}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center shadow-lg shadow-emerald-950 active:scale-98"
                >
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>COMPRAR {contracts}x {currentAsset.symbol}</span>
                  </div>
                  <span className="text-[10px] font-mono-numbers opacity-90">{currentMarketPrice}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleExecuteOrder('SELL')}
                  className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center shadow-lg shadow-rose-950 active:scale-98"
                >
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>VENDER {contracts}x {currentAsset.symbol}</span>
                  </div>
                  <span className="text-[10px] font-mono-numbers opacity-90">{currentMarketPrice}</span>
                </button>
              )}

              {/* Botão de Emergência ZERAR + Inverter */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => handleCloseAllPositions()}
                  className="py-1.5 px-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-amber-950"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>ZERAR</span>
                </button>

                <button
                  type="button"
                  onClick={handleReversePosition}
                  className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Inverter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FIXED INSTITUTIONAL BOTTOM STATUS BAR (Connection: Estável)
         ========================================================================= */}
      <footer className="bg-[#050a14] border-t border-slate-800/90 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-mono-numbers select-none">
        {/* Left: Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-emerald-400 font-sans font-bold">Conexão: Estável</strong>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">B3 Direct Market Feed • Liquidez Ativa</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Latência: 12ms • Servidor SP-01</span>
        </div>

        {/* Center: System Clock */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400">
          <span>DinhEuro Engine Pro v3.2</span>
        </div>

        {/* Right: Security & Compliance Indicator */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Criptografia Ponta a Ponta
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 hidden sm:inline">LGPD Auditado</span>
        </div>
      </footer>

      {/* =========================================================================
          MODALS: REAL API BROKER, RISK SETTINGS, ALERTS, HELP
         ========================================================================= */}
      {showRealBrokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conexão API Corretora (Modo Real)</h3>
              </div>
              <button onClick={() => setShowRealBrokerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Conecte sua conta em corretora credenciada B3 para envio de ordens reais via gateway seguro DinhEuro.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Selecione sua Corretora:</label>
                <select className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option>BTG Pactual Digital / Investimentos</option>
                  <option>XP Investimentos</option>
                  <option>Clear Corretora</option>
                  <option>Genial Investimentos</option>
                  <option>Interactive Brokers (Global)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">API Key / Token Institucional:</label>
                <input
                  type="password"
                  placeholder="insira sua chave privada de API..."
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRealBrokerModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowRealBrokerModal(false);
                  setOperationMode('simulated');
                  setOrderNotification('Modo Real desativado por segurança. Operando no modo Simulado.');
                  setTimeout(() => setOrderNotification(null), 3500);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Salvar Chave & Ativar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gerenciador de Risco Diário</h3>
              </div>
              <button onClick={() => setShowRiskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Meta Diária de Ganho (Gain Goal R$):</label>
                <input
                  type="number"
                  value={dailyProfitGoal}
                  onChange={(e) => setDailyProfitGoal(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Limite Diário de Perda (Daily Stop Loss R$):</label>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold"
                />
              </div>

              {isRiskLocked && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
                  <span>Trava de risco acionada!</span>
                  <button
                    onClick={() => setIsRiskLocked(false)}
                    className="px-2 py-1 rounded bg-rose-600 text-white font-bold"
                  >
                    Desbloquear
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRiskModal(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Salvar Parâmetros
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white uppercase text-xs">Novo Alerta de Preço</h3>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400">Receba notificações instantâneas quando o ativo {currentAsset.symbol} atingir seu patamar:</p>
            <input
              type="number"
              defaultValue={currentMarketPrice}
              className="w-full bg-[#070e1b] border border-slate-700 rounded px-3 py-1.5 text-white font-mono-numbers font-bold"
            />
            <button
              onClick={() => {
                setShowAlertModal(false);
                setOrderNotification(`Alerta configurado para ${currentAsset.symbol} no patamar especificado!`);
                setTimeout(() => setOrderNotification(null), 3000);
              }}
              className="w-full py-2 rounded bg-emerald-600 text-white font-bold"
            >
              Criar Alerta
            </button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white uppercase text-xs">Atalhos de Teclado do Terminal</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between p-1 bg-slate-900 rounded">
                <span>Comprar a Mercado</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-emerald-400 font-bold">Shift + B</kbd>
              </div>
              <div className="flex justify-between p-1 bg-slate-900 rounded">
                <span>Vender a Mercado</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-rose-400 font-bold">Shift + S</kbd>
              </div>
              <div className="flex justify-between p-1 bg-slate-900 rounded">
                <span>Zerar Posição Imediata</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-400 font-bold">Espaço / Esc</kbd>
              </div>
              <div className="flex justify-between p-1 bg-slate-900 rounded">
                <span>Inverter Posição</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-sky-400 font-bold">Shift + R</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-1.5 rounded bg-slate-800 text-slate-200 font-bold hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
