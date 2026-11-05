import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  Maximize2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Play,
  Square,
  RefreshCw,
  SlidersHorizontal,
  Key,
  HelpCircle,
  BarChart3,
  Flame,
  Target,
  ArrowRightLeft,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
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
}

export interface TradeTapeItem {
  id: string;
  time: string;
  price: number;
  qty: number;
  buyerBroker: string;
  sellerBroker: string;
  aggressor: 'BUY' | 'SELL';
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
  const { assets, universalRates } = useMarket();

  // 1. Assets Selection
  const dayTradeAssets = useMemo(() => {
    // Curated high-liquidity assets for Day Trading (Futures, Large Caps, Forex, Crypto)
    const customList = [
      {
        id: 'win_fut',
        symbol: 'WIN$',
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
        tickValue: 1.0, // R$ 0.20 per point (5 pts = R$ 1.00 per contract)
      },
      {
        id: 'wdo_fut',
        symbol: 'WDO$',
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
        tickValue: 5.0, // R$ 10.00 per point (0.5 pt = R$ 5.00)
      },
      ...assets.filter((a) =>
        ['PETR4', 'VALE3', 'ITUB4', 'BTC/USD', 'ETH/USD', 'AAPL', 'NVDA', 'EUR/USD', 'IBOVESPA'].includes(
          a.symbol
        )
      ),
    ];
    return customList as (MarketAsset & { tickSize?: number; tickValue?: number })[];
  }, [assets]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>('WIN$');
  const currentAsset = dayTradeAssets.find((a) => a.symbol === selectedSymbol) || dayTradeAssets[0];

  // 2. Mode Toggle (Simulado vs Real)
  const [operationMode, setOperationMode] = useState<'simulated' | 'real'>('simulated');
  const [showRealBrokerModal, setShowRealBrokerModal] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);

  // 3. Risk Management State
  const [dailyProfitGoal, setDailyProfitGoal] = useState<number>(2000); // R$ 2.000
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000); // R$ 1.000
  const [isRiskLocked, setIsRiskLocked] = useState<boolean>(false);

  // 4. Paper Trading Account
  const [accountBalance, setAccountBalance] = useState<number>(100000); // R$ 100.000,00
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [positions, setPositions] = useState<DayTradePosition[]>([]);
  const [closedTrades, setClosedTrades] = useState<DayTradeClosedTrade[]>([]);

  // 5. Order Ticket State
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [contracts, setContracts] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(currentAsset.price);
  const [useStopLoss, setUseStopLoss] = useState<boolean>(true);
  const [stopLossOffset, setStopLossOffset] = useState<number>(150); // points or cents
  const [useTakeProfit, setUseTakeProfit] = useState<boolean>(true);
  const [takeProfitOffset, setTakeProfitOffset] = useState<number>(300); // points or cents
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // 6. Timeframe for Intraday Chart (1m, 5m, 15m)
  const [chartInterval, setChartInterval] = useState<'1m' | '5m' | '15m'>('5m');
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(currentAsset.price);

  // Synchronize price when asset changes
  useEffect(() => {
    setCurrentMarketPrice(currentAsset.price);
    setLimitPrice(currentAsset.price);
  }, [currentAsset]);

  // Floating P&L Calculation
  const floatingPnlBrl = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const isWin = pos.symbol === 'WIN$';
      const isWdo = pos.symbol === 'WDO$';
      const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;

      let tradeVal = 0;
      if (isWin) {
        tradeVal = diff * 0.2 * pos.contracts; // R$ 0.20 per point per contract
      } else if (isWdo) {
        tradeVal = diff * 10 * pos.contracts; // R$ 10.00 per point per contract
      } else {
        tradeVal = diff * pos.contracts;
      }
      return acc + tradeVal;
    }, 0);
  }, [positions, currentMarketPrice]);

  const floatingPnlUsd = floatingPnlBrl / (universalRates.BRL || 5.48);
  const totalDayPnl = realizedPnl + floatingPnlBrl;

  // Check Risk Management Locks
  useEffect(() => {
    if (totalDayPnl <= -Math.abs(dailyLossLimit)) {
      if (!isRiskLocked) {
        setIsRiskLocked(true);
        // Automatically close all open positions when daily stop loss is breached
        if (positions.length > 0) {
          handleCloseAllPositions('Limite diário de perda atingido! Trava de risco institucional acionada.');
        }
      }
    }
  }, [totalDayPnl, dailyLossLimit, isRiskLocked, positions]);

  // Simulated Market Microstructure (DOM Book & Times and Trades)
  const [bookOffers, setBookOffers] = useState<BookOffer[]>([]);
  const [timesAndTrades, setTimesAndTrades] = useState<TradeTapeItem[]>([]);

  // Generate initial DOM and Tape, update dynamically
  useEffect(() => {
    const step = currentAsset.symbol === 'WIN$' ? 5 : currentAsset.symbol === 'WDO$' ? 0.5 : 0.05;
    const base = currentMarketPrice;

    // Generate 12 levels of DOM
    const offers: BookOffer[] = [];
    for (let i = 6; i >= -6; i--) {
      if (i === 0) continue;
      const p = Number((base + i * step).toFixed(2));
      const bQty = i < 0 ? Math.floor(Math.random() * 450 + 50) : 0;
      const aQty = i > 0 ? Math.floor(Math.random() * 450 + 50) : 0;
      offers.push({
        price: p,
        bidQty: bQty,
        askQty: aQty,
        bidVolPct: Math.min(100, Math.round((bQty / 500) * 100)),
        askVolPct: Math.min(100, Math.round((aQty / 500) * 100)),
      });
    }
    setBookOffers(offers);

    // Initial 8 trades for Times and Trades
    const initialTrades: TradeTapeItem[] = [];
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const offset = (Math.random() - 0.5) * step * 2;
      initialTrades.push({
        id: `trade_${now}_${i}`,
        time: new Date(now - i * 1800).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: Number((base + offset).toFixed(2)),
        qty: Math.floor(Math.random() * 40 + 5),
        buyerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        sellerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        aggressor: side,
      });
    }
    setTimesAndTrades(initialTrades);
  }, [selectedSymbol, currentAsset]);

  // Live Tick Simulation for Day Trade Tape and Minor Price Jitter
  useEffect(() => {
    const interval = setInterval(() => {
      const step = currentAsset.symbol === 'WIN$' ? 5 : currentAsset.symbol === 'WDO$' ? 0.5 : 0.05;
      const delta = (Math.random() - 0.49) * step;
      const newPrice = Number((currentMarketPrice + delta).toFixed(2));
      setCurrentMarketPrice(newPrice);

      // Add a live tick to Times & Trades
      const side: 'BUY' | 'SELL' = Math.random() > 0.48 ? 'BUY' : 'SELL';
      const newTrade: TradeTapeItem = {
        id: `tick_${Date.now()}_${Math.random()}`,
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: newPrice,
        qty: Math.floor(Math.random() * 25 + 5),
        buyerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        sellerBroker: BROKERS_POOL[Math.floor(Math.random() * BROKERS_POOL.length)],
        aggressor: side,
      };

      setTimesAndTrades((prev) => [newTrade, ...prev.slice(0, 19)]);
    }, 2800);

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
    const step = currentAsset.symbol === 'WIN$' ? 5 : currentAsset.symbol === 'WDO$' ? 0.5 : 0.05;

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
    setTimeout(() => setOrderNotification(null), 3500);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const isWin = pos.symbol === 'WIN$';
    const isWdo = pos.symbol === 'WDO$';
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
      `Posição zerada: ${pos.symbol} com resultado de ${pnl >= 0 ? '+' : ''}${formatCurrencyValue(pnl, 'BRL')}`
    );
    setTimeout(() => setOrderNotification(null), 3500);
  };

  const handleCloseAllPositions = (reason?: string) => {
    if (positions.length === 0) return;

    let batchPnl = 0;
    const newClosed: DayTradeClosedTrade[] = [];

    positions.forEach((pos) => {
      const isWin = pos.symbol === 'WIN$';
      const isWdo = pos.symbol === 'WDO$';
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

    setOrderNotification(reason || `Todas as posições foram zeradas! Resultado consolidado: ${batchPnl >= 0 ? '+' : ''}${formatCurrencyValue(batchPnl, 'BRL')}`);
    setTimeout(() => setOrderNotification(null), 4000);
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
      setTimeout(() => setOrderNotification(null), 3500);
    }, 200);
  };

  // Win Rate calculation
  const totalTradesCount = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => t.pnlBrl > 0).length;
  const winRate = totalTradesCount > 0 ? Math.round((winningTrades / totalTradesCount) * 100) : 0;

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* --- TOP INSTITUTIONAL METRICS & MODE STRIP --- */}
      <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Asset Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Terminal Day Trade & Scalping
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  DMA / Book 360º
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execução de alta velocidade, DOM, Times & Trades e travas automáticas de risco.
              </p>
            </div>
          </div>

          {/* Asset Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-[#070e1b] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 shadow-inner cursor-pointer"
            >
              <optgroup label="Futuros B3 (Alta Liquidez)">
                <option value="WIN$">WIN$ - Mini Índice B3</option>
                <option value="WDO$">WDO$ - Mini Dólar B3</option>
              </optgroup>
              <optgroup label="Ações B3">
                <option value="PETR4">PETR4 - Petrobras PN</option>
                <option value="VALE3">VALE3 - Vale ON</option>
                <option value="ITUB4">ITUB4 - Itaú Unibanco</option>
              </optgroup>
              <optgroup label="Criptoativos 24/7">
                <option value="BTC/USD">BTC/USD - Bitcoin</option>
                <option value="ETH/USD">ETH/USD - Ethereum</option>
              </optgroup>
              <optgroup label="Ações Internacionais (EUA)">
                <option value="AAPL">AAPL - Apple Inc.</option>
                <option value="NVDA">NVDA - NVIDIA Corp</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Right: Operational Mode Switcher & Risk Trava */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Risk Lock Indicator */}
          <button
            type="button"
            onClick={() => setShowRiskModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isRiskLocked
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isRiskLocked ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRiskLocked ? 'Trava de Risco Ativa' : 'Gerenciamento de Risco'}</span>
          </button>

          {/* Operation Mode Selector: Simulated vs Real */}
          <div className="flex items-center bg-[#070e1b] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setOperationMode('simulated')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                operationMode === 'simulated'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
              <span>Simulado (Paper)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOperationMode('real');
                setShowRealBrokerModal(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                operationMode === 'real'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>Modo Real (API)</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- LIVE FINANCIAL METRICS BAR --- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo da Conta</span>
          <p className="text-base font-bold font-mono-numbers text-white">
            {formatCurrencyValue(accountBalance, 'BRL')}
          </p>
          <span className="text-[10px] text-slate-500">Virtual Paper Trading</span>
        </div>

        <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">P&L Aberto (Floating)</span>
          <p
            className={`text-base font-bold font-mono-numbers flex items-center gap-1 ${
              floatingPnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {floatingPnlBrl >= 0 ? '+' : ''}
            {formatCurrencyValue(floatingPnlBrl, 'BRL')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono-numbers">
            ≈ {floatingPnlUsd >= 0 ? '+' : ''}${floatingPnlUsd.toFixed(2)} USD
          </span>
        </div>

        <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Resultado Realizado</span>
          <p
            className={`text-base font-bold font-mono-numbers flex items-center gap-1 ${
              realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {realizedPnl >= 0 ? '+' : ''}
            {formatCurrencyValue(realizedPnl, 'BRL')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono-numbers">
            {closedTrades.length} trades encerrados
          </span>
        </div>

        <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Resultado Total do Dia</span>
          <p
            className={`text-base font-black font-mono-numbers flex items-center gap-1 ${
              totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalDayPnl >= 0 ? '+' : ''}
            {formatCurrencyValue(totalDayPnl, 'BRL')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono-numbers">
            Meta: {formatCurrencyValue(dailyProfitGoal, 'BRL', 0)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#0b1322] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Taxa de Acerto (Win Rate)</span>
          <p className="text-base font-bold font-mono-numbers text-amber-400">
            {winRate}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono-numbers">
            {winningTrades} acertos / {totalTradesCount} trades
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {orderNotification && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
          <span className="font-semibold">{orderNotification}</span>
          <button onClick={() => setOrderNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --- MAIN TRADING WORKSPACE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* --- LEFT & CENTER COLUMN: CHART & ACTIVE POSITIONS (8 COLS) --- */}
        <div className="lg:col-span-8 space-y-4">
          {/* Intraday Scalping Chart */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white font-mono-numbers">
                  {currentAsset.symbol}
                </span>
                <span className="text-base font-black font-mono-numbers text-emerald-400">
                  {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
                </span>
                <span
                  className={`text-xs font-semibold font-mono-numbers ${
                    currentAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentAsset.change24h >= 0 ? '+' : ''}
                  {currentAsset.change24h}%
                </span>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1.5 bg-[#070e1b] p-1 rounded-xl border border-slate-800">
                {(['1m', '5m', '15m'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartInterval(tf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      chartInterval === tf
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live SVG Intraday Candlestick Chart with Overlays */}
            <div className="h-72 w-full relative bg-[#070e1b] rounded-xl overflow-hidden border border-slate-800/80 p-2">
              <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grid-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />

                {/* Candles Simulation */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const x = 20 + i * 20;
                  const isUp = i % 2 === 0 || i % 5 === 0;
                  const open = 110 + Math.sin(i * 0.4) * 35;
                  const close = isUp ? open - 18 : open + 16;
                  const high = Math.min(open, close) - 12;
                  const low = Math.max(open, close) + 12;
                  const color = isUp ? '#10B981' : '#EF4444';

                  return (
                    <g key={i}>
                      {/* Wick */}
                      <line x1={x + 5} y1={high} x2={x + 5} y2={low} stroke={color} strokeWidth="1.5" />
                      {/* Body */}
                      <rect
                        x={x}
                        y={Math.min(open, close)}
                        width="10"
                        height={Math.max(4, Math.abs(close - open))}
                        fill={color}
                        rx="1"
                      />
                    </g>
                  );
                })}

                {/* VWAP Overlay Line */}
                <path
                  d="M 20 125 Q 150 110, 300 120 T 580 115"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* EMA 9 / EMA 21 Trend Line */}
                <path
                  d="M 20 135 Q 180 100, 350 110 T 580 105"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  opacity="0.9"
                />

                {/* If there is an active position, overlay entry line */}
                {positions.length > 0 && (
                  <g>
                    <line x1="0" y1="108" x2="600" y2="108" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="5 3" />
                    <text x="10" y="103" fill="#60A5FA" fontSize="10" fontWeight="bold">
                      Preço Médio Entrada ({positions[0].side}): {formatCurrencyValue(positions[0].entryPrice, currentAsset.currency)}
                    </text>
                  </g>
                )}
              </svg>

              {/* Chart Overlay Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-2 text-[10px] font-mono-numbers">
                <span className="text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                  VWAP: {formatCurrencyValue(currentMarketPrice * 0.998, currentAsset.currency)}
                </span>
                <span className="text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                  EMA 9: {formatCurrencyValue(currentMarketPrice * 1.001, currentAsset.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Open Positions Table & Closed History Tabs */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Posições em Aberto ({positions.length})</span>
                </h3>
              </div>

              {positions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleCloseAllPositions()}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                >
                  Zerar Todas as Posições
                </button>
              )}
            </div>

            {/* Positions Table */}
            {positions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <p>Nenhuma posição aberta no momento.</p>
                <p className="text-[11px] text-slate-600">
                  Utilize a boleta de negociação à direita para abrir ordens a mercado ou limitadas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070e1b] text-slate-400 border-b border-slate-800 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Ativo</th>
                      <th className="py-2.5 px-3">Sentido</th>
                      <th className="py-2.5 px-3 text-right">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Entrada</th>
                      <th className="py-2.5 px-3 text-right">Atual</th>
                      <th className="py-2.5 px-3 text-right">P&L (R$)</th>
                      <th className="py-2.5 px-3 text-right">P&L (USD)</th>
                      <th className="py-2.5 px-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                    {positions.map((pos) => {
                      const isWin = pos.symbol === 'WIN$';
                      const isWdo = pos.symbol === 'WDO$';
                      const diff =
                        pos.side === 'BUY'
                          ? currentMarketPrice - pos.entryPrice
                          : pos.entryPrice - currentMarketPrice;

                      let pnlBrl = 0;
                      if (isWin) pnlBrl = diff * 0.2 * pos.contracts;
                      else if (isWdo) pnlBrl = diff * 10 * pos.contracts;
                      else pnlBrl = diff * pos.contracts;

                      const pnlUsd = pnlBrl / (universalRates.BRL || 5.48);

                      return (
                        <tr key={pos.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                            <span>{pos.symbol}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{pos.openTime}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pos.side === 'BUY'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {pos.side === 'BUY' ? 'COMPRA' : 'VENDA'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                            {pos.contracts}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            {formatCurrencyValue(pos.entryPrice, currentAsset.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-white font-bold">
                            {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-black ${
                              pnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pnlBrl >= 0 ? '+' : ''}
                            {formatCurrencyValue(pnlBrl, 'BRL')}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-semibold ${
                              pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
                            >
                              Zerar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Closed Trades History */}
            {closedTrades.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Histórico de Operações do Dia ({closedTrades.length})
                </span>
                <div className="max-h-40 overflow-y-auto no-scrollbar rounded-xl border border-slate-800/80">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#070e1b] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-2.5">Horário</th>
                        <th className="py-2 px-2.5">Ativo</th>
                        <th className="py-2 px-2.5">Sentido</th>
                        <th className="py-2 px-2.5 text-right">Qtd</th>
                        <th className="py-2 px-2.5 text-right">Entrada</th>
                        <th className="py-2 px-2.5 text-right">Saída</th>
                        <th className="py-2 px-2.5 text-right">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono-numbers">
                      {closedTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="py-1.5 px-2.5 text-slate-500">{t.closeTime}</td>
                          <td className="py-1.5 px-2.5 font-bold text-white">{t.symbol}</td>
                          <td className="py-1.5 px-2.5">
                            <span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                              {t.side}
                            </span>
                          </td>
                          <td className="py-1.5 px-2.5 text-right text-slate-300">{t.contracts}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-400">{t.entryPrice}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-300">{t.exitPrice}</td>
                          <td
                            className={`py-1.5 px-2.5 text-right font-bold ${
                              t.pnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {t.pnlBrl >= 0 ? '+' : ''}
                            {formatCurrencyValue(t.pnlBrl, 'BRL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: ORDER TICKET, DOM BOOK & TIMES AND TRADES (4 COLS) --- */}
        <div className="lg:col-span-4 space-y-4">
          {/* MÓDULO A: BOLETA DE NEGOCIAÇÃO (ORDER TICKET) */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Boleta de Negociação</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Spread: {currentAsset.symbol === 'WIN$' ? '5 pts' : '0.5 pt'}
              </span>
            </div>

            {/* Order Type Selector */}
            <div className="grid grid-cols-3 gap-1 bg-[#070e1b] p-1 rounded-xl border border-slate-800">
              {(['MARKET', 'LIMIT', 'STOP'] as const).map((ot) => (
                <button
                  key={ot}
                  type="button"
                  onClick={() => setOrderType(ot)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    orderType === ot
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ot === 'MARKET' ? 'Mercado' : ot === 'LIMIT' ? 'Limite' : 'Stop'}
                </button>
              ))}
            </div>

            {/* Quantity / Contracts Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Contratos / Lotes:</span>
                <span className="text-slate-500 font-mono-numbers text-[10px]">Lote padrão: 1</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={contracts}
                  onChange={(e) => setContracts(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#070e1b] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold outline-none"
                />
              </div>

              {/* Quick Qty Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setContracts(qty)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      contracts === qty
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price Input if not market */}
            {orderType !== 'MARKET' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Preço Disparo / Limite:</label>
                <input
                  type="number"
                  step={currentAsset.symbol === 'WIN$' ? 5 : 0.5}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold outline-none"
                />
              </div>
            )}

            {/* Stop Loss & Take Profit Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#070e1b] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-rose-400 uppercase">Stop Loss</label>
                  <input
                    type="checkbox"
                    checked={useStopLoss}
                    onChange={(e) => setUseStopLoss(e.target.checked)}
                    className="accent-rose-500 rounded cursor-pointer"
                  />
                </div>
                {useStopLoss && (
                  <input
                    type="number"
                    value={stopLossOffset}
                    onChange={(e) => setStopLossOffset(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono-numbers text-xs"
                    placeholder="Pontos"
                  />
                )}
              </div>

              <div className="bg-[#070e1b] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Take Profit</label>
                  <input
                    type="checkbox"
                    checked={useTakeProfit}
                    onChange={(e) => setUseTakeProfit(e.target.checked)}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                {useTakeProfit && (
                  <input
                    type="number"
                    value={takeProfitOffset}
                    onChange={(e) => setTakeProfitOffset(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono-numbers text-xs"
                    placeholder="Pontos"
                  />
                )}
              </div>
            </div>

            {/* ACTION BUTTONS: BUY, SELL, ZERAR */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleExecuteOrder('BUY')}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-98"
                >
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Compra Mercado</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-mono-numbers">
                    {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteOrder('SELL')}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-950/50 transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-98"
                >
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Venda Mercado</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-mono-numbers">
                    {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
                  </span>
                </button>
              </div>

              {/* Zerar & Inverter Posição */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCloseAllPositions()}
                  className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Zerar Posição</span>
                </button>

                <button
                  type="button"
                  onClick={handleReversePosition}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Inverter Posição</span>
                </button>
              </div>
            </div>
          </div>

          {/* MÓDULO C: BOOK DE OFERTAS (DOM) & TIMES AND TRADES */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Book de Ofertas (DOM)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500">Profundidade Nível 1</span>
            </div>

            {/* DOM Table */}
            <div className="space-y-1 font-mono-numbers text-[11px]">
              <div className="grid grid-cols-3 text-slate-500 text-[10px] uppercase pb-1 border-b border-slate-800/60 font-semibold px-1">
                <span>Compra (Bid)</span>
                <span className="text-center">Preço</span>
                <span className="text-right">Venda (Ask)</span>
              </div>

              {bookOffers.map((offer, idx) => {
                const isSpread = idx === Math.floor(bookOffers.length / 2);

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-3 items-center py-1 px-1 rounded relative ${
                      isSpread ? 'bg-slate-800/80 font-bold text-amber-300' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Bid Volume Bar */}
                    <div className="relative flex items-center">
                      {offer.bidQty > 0 && (
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-blue-500/20 rounded"
                          style={{ width: `${offer.bidVolPct}%` }}
                        />
                      )}
                      <span className="relative z-10 text-blue-400 font-bold pl-1">
                        {offer.bidQty > 0 ? offer.bidQty : ''}
                      </span>
                    </div>

                    {/* Price in center */}
                    <span className="text-center text-slate-200 font-bold">
                      {offer.price.toFixed(2)}
                    </span>

                    {/* Ask Volume Bar */}
                    <div className="relative flex items-center justify-end">
                      {offer.askQty > 0 && (
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-rose-500/20 rounded"
                          style={{ width: `${offer.askVolPct}%` }}
                        />
                      )}
                      <span className="relative z-10 text-rose-400 font-bold pr-1">
                        {offer.askQty > 0 ? offer.askQty : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIMES & TRADES (FITA DE NEGÓCIOS) */}
          <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Times & Trades (Últimos Negócios)
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ao Vivo
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 font-mono-numbers text-[11px]">
              <div className="grid grid-cols-4 text-slate-500 text-[10px] uppercase pb-1 border-b border-slate-800/60 font-semibold px-1">
                <span>Hora</span>
                <span>Preço</span>
                <span className="text-right">Qtd</span>
                <span className="text-right">Agressão</span>
              </div>

              {timesAndTrades.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 items-center py-0.5 px-1 hover:bg-slate-800/30 rounded transition text-[11px]"
                >
                  <span className="text-slate-500">{item.time}</span>
                  <span className="font-bold text-white">{item.price.toFixed(2)}</span>
                  <span className="text-right text-slate-300 font-semibold">{item.qty}</span>
                  <span
                    className={`text-right font-bold text-[10px] ${
                      item.aggressor === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.aggressor === 'BUY' ? 'COMPRADOR' : 'VENDEDOR'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE GERENCIAMENTO DE RISCO --- */}
      {showRiskModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-[#0c1527] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080f1e]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Travas de Risco Institucional (Risk Engine)</h3>
                  <p className="text-[11px] text-slate-400">Proteção de capital e disciplina operacional diária.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Meta de Ganho Diária (Daily Profit Target - R$):
                </label>
                <input
                  type="number"
                  value={dailyProfitGoal}
                  onChange={(e) => setDailyProfitGoal(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono-numbers font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Atingida a meta, o painel exibe aviso de meta batida para encerramento de sessão.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Limite de Perda Diária (Max Daily Stop Loss - R$):
                </label>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-mono-numbers font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Se o prejuízo diário atingir este valor, novas ordens são BLOQUEADAS automaticamente no simulador.
                </span>
              </div>

              {isRiskLocked && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
                  <span>Trava de risco acionada no dia de hoje.</span>
                  <button
                    type="button"
                    onClick={() => setIsRiskLocked(false)}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 cursor-pointer"
                  >
                    Desbloquear
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#080f1e] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Parâmetros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE INTEGRAÇÃO COM CORRETORA REAL --- */}
      {showRealBrokerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-[#0c1527] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080f1e]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Integração de Corretora Real (API Gateway)</h3>
                  <p className="text-[11px] text-slate-400">Roteamento de ordens institucionais FIX / WebSocket.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRealBrokerModal(false);
                  setOperationMode('simulated');
                }}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed space-y-1">
                <strong>Modo Real em Preparação Institucional:</strong>
                <p className="text-[11px] text-slate-300">
                  O DinhEuro está homologando os conectores de API DMA2 para envio de ordens reais com corretoras parceiras autorizadas no Brasil e no exterior.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Selecione a Corretora Parceira:</label>
                  <select className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-medium">
                    <option>BTG Pactual Empresas / Digital</option>
                    <option>XP Investimentos</option>
                    <option>Interactive Brokers (EUA/Global)</option>
                    <option>Genial Investimentos</option>
                    <option>Clear Corretora</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Chave de API / Conta Master:</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#080f1e] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Operando com segurança no Modo Simulado.</span>
              <button
                type="button"
                onClick={() => {
                  setShowRealBrokerModal(false);
                  setOperationMode('simulated');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Retornar ao Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
