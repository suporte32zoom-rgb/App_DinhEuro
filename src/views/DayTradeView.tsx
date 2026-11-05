import React, { useState, useEffect, useMemo } from 'react';
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
  const { assets, universalRates } = useMarket();

  // 1. Assets Selection
  const dayTradeAssets = useMemo(() => {
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
        tickValue: 1.0, // 5 pts = R$ 1.00 por contrato
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
        tickValue: 5.0, // 0.5 pt = R$ 5.00
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
  const [activeBottomTab, setActiveBottomTab] = useState<'positions' | 'history' | 'risk'>('positions');

  // 5. Order Ticket State
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
        if (positions.length > 0) {
          handleCloseAllPositions('Limite diário de perda atingido! Trava de risco institucional acionada.');
        }
      }
    }
  }, [totalDayPnl, dailyLossLimit, isRiskLocked, positions]);

  // Simulated Market Microstructure (DOM Book & Times and Trades)
  const [bookOffers, setBookOffers] = useState<BookOffer[]>([]);
  const [timesAndTrades, setTimesAndTrades] = useState<TradeTapeItem[]>([]);

  // Generate 20 levels of DOM for high-density terminal
  useEffect(() => {
    const step = currentAsset.symbol === 'WIN$' ? 5 : currentAsset.symbol === 'WDO$' ? 0.5 : 0.05;
    const base = currentMarketPrice;

    const offers: BookOffer[] = [];
    for (let i = 10; i >= -10; i--) {
      if (i === 0) continue;
      const p = Number((base + i * step).toFixed(step < 1 ? 2 : 0));
      const bQty = i < 0 ? Math.floor(Math.random() * 450 + 40) : 0;
      const aQty = i > 0 ? Math.floor(Math.random() * 450 + 40) : 0;
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

    // Initial 15 trades for Times and Trades
    const initialTrades: TradeTapeItem[] = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
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

  // Live Tick Simulation for Day Trade Tape and Minor Price Jitter
  useEffect(() => {
    const interval = setInterval(() => {
      const step = currentAsset.symbol === 'WIN$' ? 5 : currentAsset.symbol === 'WDO$' ? 0.5 : 0.05;
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

      setTimesAndTrades((prev) => [newTrade, ...prev.slice(0, 30)]);
    }, 2400);

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
      `Posição encerrada: ${pos.symbol} com resultado de ${pnl >= 0 ? '+' : ''}${formatCurrencyValue(pnl, 'BRL')}`
    );
    setTimeout(() => setOrderNotification(null), 3000);
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

    setOrderNotification(reason || `Todas as posições foram zeradas! Resultado: ${batchPnl >= 0 ? '+' : ''}${formatCurrencyValue(batchPnl, 'BRL')}`);
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

  // Win Rate calculation
  const totalTradesCount = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => t.pnlBrl > 0).length;
  const winRate = totalTradesCount > 0 ? Math.round((winningTrades / totalTradesCount) * 100) : 0;

  return (
    <div className="w-full flex flex-col h-full min-h-0 text-slate-100 select-none overflow-hidden pb-1">
      {/* =========================================================================
          1. TOP CONTROL & METRICS STRIP (ULTRA DENSE - 42px)
         ========================================================================= */}
      <div className="bg-[#09111e] border border-slate-800 rounded-lg px-2.5 py-1 mb-1.5 flex items-center justify-between gap-2 flex-wrap shrink-0">
        {/* Left: Asset Switcher & Real-Time Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Asset Select Dropdown */}
          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              aria-label="Selecionar ativo para Day Trade"
              className="bg-[#0f1a2e] border border-slate-700 hover:border-emerald-500 rounded-md pl-2 pr-6 py-1 text-xs font-black text-white font-mono-numbers focus:outline-none cursor-pointer"
            >
              <optgroup label="Futuros B3">
                <option value="WIN$">WIN$ • Mini Índice</option>
                <option value="WDO$">WDO$ • Mini Dólar</option>
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

          {/* Asset Quick Badges */}
          <div className="hidden xl:flex items-center gap-1">
            {['WIN$', 'WDO$', 'PETR4', 'VALE3', 'BTC/USD'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                  selectedSymbol === sym
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Live Price Tag */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
            <span className="text-sm font-black font-mono-numbers text-white">
              {formatCurrencyValue(currentMarketPrice, currentAsset.currency)}
            </span>
            <span
              className={`text-[10px] font-bold font-mono-numbers px-1 py-0.2 rounded flex items-center ${
                currentAsset.change24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
              }`}
            >
              {currentAsset.change24h >= 0 ? '+' : ''}
              {currentAsset.change24h}%
            </span>
            <span className="text-[10px] text-slate-500 font-mono-numbers hidden md:inline">
              Mín: {currentAsset.low24h} | Máx: {currentAsset.high24h}
            </span>
          </div>
        </div>

        {/* Center: Live Financial KPI Chips in Single Horizontal Row */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-numbers">
          <div className="bg-[#060c18] border border-slate-800/90 rounded px-2 py-0.5 flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">Saldo:</span>
            <strong className="text-white font-bold">{formatCurrencyValue(accountBalance, 'BRL')}</strong>
          </div>

          <div className="bg-[#060c18] border border-slate-800/90 rounded px-2 py-0.5 flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">P&L Aberto:</span>
            <strong className={`font-bold ${floatingPnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {floatingPnlBrl >= 0 ? '+' : ''}{formatCurrencyValue(floatingPnlBrl, 'BRL')}
            </strong>
          </div>

          <div className="bg-[#060c18] border border-slate-800/90 rounded px-2 py-0.5 flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">Realizado:</span>
            <strong className={`font-bold ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {realizedPnl >= 0 ? '+' : ''}{formatCurrencyValue(realizedPnl, 'BRL')}
            </strong>
          </div>

          <div className="bg-[#060c18] border border-slate-800/90 rounded px-2 py-0.5 flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">Total Dia:</span>
            <strong className={`font-black ${totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalDayPnl >= 0 ? '+' : ''}{formatCurrencyValue(totalDayPnl, 'BRL')}
            </strong>
          </div>

          <div className="bg-[#060c18] border border-slate-800/90 rounded px-2 py-0.5 flex items-center gap-1 text-[10px]">
            <span className="text-slate-500">Win Rate:</span>
            <strong className="text-amber-400 font-bold">{winRate}%</strong>
          </div>
        </div>

        {/* Right: Risk Lock Indicator & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Risk Button */}
          <button
            type="button"
            onClick={() => setShowRiskModal(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
              isRiskLocked
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isRiskLocked ? <Lock className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            <span>{isRiskLocked ? 'Trava Ativa' : 'Risco'}</span>
          </button>

          {/* Simulator Reset Button */}
          <button
            type="button"
            onClick={handleResetSimulator}
            title="Resetar conta de simulação para R$ 100.000"
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#070e1b] p-0.5 rounded border border-slate-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setOperationMode('simulated')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                operationMode === 'simulated'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulado
            </button>
            <button
              type="button"
              onClick={() => {
                setOperationMode('real');
                setShowRealBrokerModal(true);
              }}
              className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                operationMode === 'real'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-2.5 h-2.5" />
              Real (API)
            </button>
          </div>
        </div>
      </div>

      {/* Floating Order Notification Banner */}
      {orderNotification && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-3 py-1 rounded text-xs flex items-center justify-between shadow-lg mb-1 animate-in fade-in shrink-0">
          <span className="font-semibold">{orderNotification}</span>
          <button onClick={() => setOrderNotification(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. MAIN TRADING WORKSPACE GRID (NO VERTICAL SCROLL - FITS SCREEN)
         ========================================================================= */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-1.5 overflow-hidden">
        {/* =====================================================================
            COL 1: CHART + BOTTOM POSITIONS DOCK (6 Cols on desktop)
           ===================================================================== */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full min-h-0 gap-1.5">
          {/* Intraday Chart Workspace Pane */}
          <div className="flex-1 min-h-0 bg-[#09111e] border border-slate-800 rounded-lg p-2 flex flex-col overflow-hidden">
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 mb-1.5 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono-numbers">{currentAsset.symbol}</span>
                <span className="text-[10px] text-slate-400">{currentAsset.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Timeframes */}
                <div className="flex items-center bg-[#060c18] p-0.5 rounded border border-slate-800 text-[10px] font-bold">
                  {(['1m', '5m', '15m'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setChartInterval(tf)}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        chartInterval === tf ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Overlays indicators */}
                <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono-numbers">
                  <span className="text-purple-400 bg-purple-950/60 px-1 py-0.2 rounded border border-purple-500/30">
                    VWAP
                  </span>
                  <span className="text-sky-400 bg-sky-950/60 px-1 py-0.2 rounded border border-sky-500/30">
                    EMA 9
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Candlestick Chart Area (Flex-1) */}
            <div className="flex-1 min-h-0 relative bg-[#060c18] rounded border border-slate-800/70 p-1 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="55" x2="600" y2="55" stroke="#1e293b" strokeDasharray="3 3" opacity="0.5" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="#1e293b" strokeDasharray="3 3" opacity="0.5" />
                <line x1="0" y1="165" x2="600" y2="165" stroke="#1e293b" strokeDasharray="3 3" opacity="0.5" />

                {/* Candles Simulation */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const x = 12 + i * 19.5;
                  const isUp = i % 2 === 0 || i % 5 === 0;
                  const open = 100 + Math.sin(i * 0.4) * 30;
                  const close = isUp ? open - 16 : open + 14;
                  const high = Math.min(open, close) - 10;
                  const low = Math.max(open, close) + 10;
                  const color = isUp ? '#10B981' : '#EF4444';

                  return (
                    <g key={i}>
                      <line x1={x + 4.5} y1={high} x2={x + 4.5} y2={low} stroke={color} strokeWidth="1.2" />
                      <rect
                        x={x}
                        y={Math.min(open, close)}
                        width="9"
                        height={Math.max(3, Math.abs(close - open))}
                        fill={color}
                        rx="0.5"
                      />
                    </g>
                  );
                })}

                {/* VWAP Line */}
                <path
                  d="M 12 115 Q 150 95, 300 108 T 588 102"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />

                {/* EMA 9 Line */}
                <path
                  d="M 12 122 Q 180 88, 350 98 T 588 92"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1.8"
                  opacity="0.9"
                />

                {/* Active Position Overlay Line */}
                {positions.length > 0 && (
                  <g>
                    <line x1="0" y1="98" x2="600" y2="98" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="5 3" />
                    <text x="8" y="94" fill="#60A5FA" fontSize="9" fontWeight="bold">
                      Preço Médio ({positions[0].side}): {formatCurrencyValue(positions[0].entryPrice, currentAsset.currency)}
                    </text>
                  </g>
                )}
              </svg>

              {/* Price watermark */}
              <div className="absolute bottom-1 right-2 text-right pointer-events-none opacity-40">
                <span className="text-xl font-black font-mono-numbers text-slate-500">
                  {currentAsset.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Dock: Open Positions Table & History Tabs (Compact Height: ~140px) */}
          <div className="h-40 shrink-0 bg-[#09111e] border border-slate-800 rounded-lg p-2 flex flex-col min-h-0 overflow-hidden">
            {/* Dock Tab Selector Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1 shrink-0 text-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setActiveBottomTab('positions')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                    activeBottomTab === 'positions'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Posições ({positions.length})</span>
                </button>
                <button
                  onClick={() => setActiveBottomTab('history')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                    activeBottomTab === 'history'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Histórico ({closedTrades.length})</span>
                </button>
              </div>

              {positions.length > 0 && activeBottomTab === 'positions' && (
                <button
                  type="button"
                  onClick={() => handleCloseAllPositions()}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition cursor-pointer"
                >
                  Zerar Todas
                </button>
              )}
            </div>

            {/* Positions Table Pane */}
            {activeBottomTab === 'positions' ? (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {positions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-[11px]">
                    <p>Nenhuma posição aberta.</p>
                    <span className="text-[10px] text-slate-600">
                      Use a boleta rápida à direita para abrir ordens a mercado.
                    </span>
                  </div>
                ) : (
                  <table className="w-full text-left text-[10px] font-mono-numbers">
                    <thead className="bg-[#060c18] text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-1 px-1.5">Ativo</th>
                        <th className="py-1 px-1.5">Lado</th>
                        <th className="py-1 px-1.5 text-right">Qtd</th>
                        <th className="py-1 px-1.5 text-right">Entrada</th>
                        <th className="py-1 px-1.5 text-right">Atual</th>
                        <th className="py-1 px-1.5 text-right">P&L (R$)</th>
                        <th className="py-1 px-1.5 text-right">P&L (USD)</th>
                        <th className="py-1 px-1.5 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
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
                          <tr key={pos.id} className="hover:bg-slate-800/40">
                            <td className="py-1 px-1.5 font-bold text-white">{pos.symbol}</td>
                            <td className="py-1 px-1.5">
                              <span
                                className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                  pos.side === 'BUY'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-1 px-1.5 text-right font-bold text-slate-200">{pos.contracts}</td>
                            <td className="py-1 px-1.5 text-right text-slate-300">{pos.entryPrice}</td>
                            <td className="py-1 px-1.5 text-right text-white font-bold">{currentMarketPrice}</td>
                            <td
                              className={`py-1 px-1.5 text-right font-bold ${
                                pnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {pnlBrl >= 0 ? '+' : ''}
                              {formatCurrencyValue(pnlBrl, 'BRL')}
                            </td>
                            <td
                              className={`py-1 px-1.5 text-right font-semibold ${
                                pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)}
                            </td>
                            <td className="py-1 px-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleClosePosition(pos.id)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[9px] font-bold transition cursor-pointer"
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
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {closedTrades.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-[11px]">
                    Nenhum trade encerrado hoje.
                  </div>
                ) : (
                  <table className="w-full text-left text-[10px] font-mono-numbers">
                    <thead className="bg-[#060c18] text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-1 px-1.5">Hora</th>
                        <th className="py-1 px-1.5">Ativo</th>
                        <th className="py-1 px-1.5">Lado</th>
                        <th className="py-1 px-1.5 text-right">Qtd</th>
                        <th className="py-1 px-1.5 text-right">Entrada</th>
                        <th className="py-1 px-1.5 text-right">Saída</th>
                        <th className="py-1 px-1.5 text-right">P&L (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {closedTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="py-1 px-1.5 text-slate-500">{t.closeTime}</td>
                          <td className="py-1 px-1.5 font-bold text-white">{t.symbol}</td>
                          <td className="py-1 px-1.5 font-bold">
                            <span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                              {t.side}
                            </span>
                          </td>
                          <td className="py-1 px-1.5 text-right text-slate-300">{t.contracts}</td>
                          <td className="py-1 px-1.5 text-right text-slate-400">{t.entryPrice}</td>
                          <td className="py-1 px-1.5 text-right text-slate-300">{t.exitPrice}</td>
                          <td
                            className={`py-1 px-1.5 text-right font-bold ${
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            COL 2: BOOK DE OFERTAS EM PROFUNDIDADE (DOM LADDER) (3 Cols)
           ===================================================================== */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col h-full min-h-0 bg-[#09111e] border border-slate-800 rounded-lg p-1.5 overflow-hidden">
          {/* DOM Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1 shrink-0 text-xs">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">Book DOM</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono-numbers font-semibold">
              Spread: {currentAsset.symbol === 'WIN$' ? '5 pts' : '0.5 pt'}
            </span>
          </div>

          {/* DOM Column Labels */}
          <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase py-0.5 px-1 bg-[#060c18] rounded mb-1 shrink-0">
            <span className="text-left text-sky-400">Bid (Compra)</span>
            <span className="text-center text-slate-300">Preço</span>
            <span className="text-right text-rose-400">Ask (Venda)</span>
          </div>

          {/* DOM Ladder Rows (Ultra Dense, 18-20 rows visible) */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-0.5 text-[10px] font-mono-numbers">
            {bookOffers.map((offer, idx) => {
              const isSpread = idx === Math.floor(bookOffers.length / 2);
              return (
                <div
                  key={idx}
                  onClick={() => setLimitPrice(offer.price)}
                  className={`grid grid-cols-3 items-center py-0.5 px-1 rounded transition cursor-pointer select-none relative ${
                    isSpread
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold'
                      : offer.isPoc
                      ? 'bg-indigo-950/40 border border-indigo-700/30'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Bid Volume Bar */}
                  <div className="relative flex items-center">
                    {offer.bidQty > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-sky-500/25 rounded"
                        style={{ width: `${offer.bidVolPct}%` }}
                      />
                    )}
                    <span className="relative z-10 text-sky-300 font-bold pl-0.5">
                      {offer.bidQty > 0 ? offer.bidQty : ''}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-center font-bold text-white">
                    {offer.price}
                    {offer.isPoc && (
                      <span className="text-[8px] text-indigo-400 ml-1 font-sans font-black">POC</span>
                    )}
                  </div>

                  {/* Ask Volume Bar */}
                  <div className="relative flex items-center justify-end">
                    {offer.askQty > 0 && (
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-rose-500/25 rounded"
                        style={{ width: `${offer.askVolPct}%` }}
                      />
                    )}
                    <span className="relative z-10 text-rose-300 font-bold pr-0.5">
                      {offer.askQty > 0 ? offer.askQty : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DOM Bottom Quick Actions */}
          <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-1 shrink-0 text-[10px]">
            <button
              onClick={() => handleExecuteOrder('BUY')}
              className="py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold border border-emerald-500/40 transition cursor-pointer text-center"
            >
              Comprar Bid
            </button>
            <button
              onClick={() => handleExecuteOrder('SELL')}
              className="py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold border border-rose-500/40 transition cursor-pointer text-center"
            >
              Vender Ask
            </button>
          </div>
        </div>

        {/* =====================================================================
            COL 3: BOLETA RÁPIDA & TIMES AND TRADES (3 Cols)
           ===================================================================== */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col h-full min-h-0 gap-1.5 overflow-hidden">
          {/* Boleta Rápida de Execução (Fixed, Always Visible) */}
          <div className="bg-[#09111e] border border-slate-800 rounded-lg p-2 shrink-0 flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                Boleta Rápida
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Lote: {contracts}
              </span>
            </div>

            {/* Order Type Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#060c18] p-0.5 rounded border border-slate-800 text-[10px] font-bold">
              {(['MARKET', 'LIMIT', 'STOP'] as const).map((ot) => (
                <button
                  key={ot}
                  type="button"
                  onClick={() => setOrderType(ot)}
                  className={`py-0.5 rounded transition cursor-pointer ${
                    orderType === ot ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ot === 'MARKET' ? 'Mercado' : ot === 'LIMIT' ? 'Limite' : 'Stop'}
                </button>
              ))}
            </div>

            {/* Quantity Selector & Quick Chips */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="500"
                value={contracts}
                onChange={(e) => setContracts(Math.max(1, Number(e.target.value)))}
                aria-label="Quantidade de contratos"
                className="w-16 bg-[#060c18] border border-slate-700 focus:border-emerald-500 rounded px-1.5 py-0.5 text-white font-mono-numbers text-xs font-bold outline-none text-center"
              />
              <div className="flex-1 flex items-center gap-1">
                {[1, 5, 10, 25, 50].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setContracts(q)}
                    className={`flex-1 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
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

            {/* Limit Price Input if not market */}
            {orderType !== 'MARKET' && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 whitespace-nowrap">Preço Limite:</span>
                <input
                  type="number"
                  step={currentAsset.symbol === 'WIN$' ? 5 : 0.5}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#060c18] border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono-numbers text-xs font-bold outline-none"
                />
              </div>
            )}

            {/* Stop Loss & Take Profit Toggles */}
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="bg-[#060c18] px-1.5 py-1 rounded border border-slate-800/80 flex items-center justify-between">
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
                    aria-label="Offset de Stop Loss em pontos"
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-white font-mono-numbers text-right text-[10px]"
                  />
                )}
              </div>

              <div className="bg-[#060c18] px-1.5 py-1 rounded border border-slate-800/80 flex items-center justify-between">
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
                    aria-label="Offset de Take Profit em pontos"
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-white font-mono-numbers text-right text-[10px]"
                  />
                )}
              </div>
            </div>

            {/* BIG PROMINENT ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleExecuteOrder('BUY')}
                className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide transition cursor-pointer flex flex-col items-center justify-center shadow-md shadow-emerald-950 active:scale-98"
              >
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>COMPRA</span>
                </div>
                <span className="text-[10px] font-mono-numbers opacity-90">{currentMarketPrice}</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteOrder('SELL')}
                className="py-2 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wide transition cursor-pointer flex flex-col items-center justify-center shadow-md shadow-rose-950 active:scale-98"
              >
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>VENDA</span>
                </div>
                <span className="text-[10px] font-mono-numbers opacity-90">{currentMarketPrice}</span>
              </button>
            </div>

            {/* Zerar & Inverter Row */}
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleCloseAllPositions()}
                className="py-1 px-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Zerar</span>
              </button>

              <button
                type="button"
                onClick={handleReversePosition}
                className="py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowRightLeft className="w-2.5 h-2.5" />
                <span>Inverter</span>
              </button>
            </div>
          </div>

          {/* Times & Trades (Fita de Negócios Contínua) */}
          <div className="flex-1 min-h-0 bg-[#09111e] border border-slate-800 rounded-lg p-1.5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1 shrink-0 text-xs">
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">Times & Trades</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Column Labels */}
            <div className="grid grid-cols-4 text-[9px] font-bold text-slate-500 uppercase py-0.5 px-1 bg-[#060c18] rounded mb-1 shrink-0">
              <span>Hora</span>
              <span className="text-center">Preço</span>
              <span className="text-right">Qtd</span>
              <span className="text-right">Agressão</span>
            </div>

            {/* Trades Streaming Rows */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-0.5 text-[10px] font-mono-numbers">
              {timesAndTrades.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-4 items-center py-0.5 px-1 rounded transition ${
                    item.isLargeTrade
                      ? 'bg-amber-500/15 border border-amber-500/30'
                      : item.aggressor === 'BUY'
                      ? 'bg-emerald-950/20'
                      : 'bg-rose-950/20'
                  }`}
                >
                  <span className="text-slate-400 text-[9px]">{item.time.split(' ')[0]}</span>
                  <span
                    className={`text-center font-bold ${
                      item.aggressor === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.price}
                  </span>
                  <span className="text-right font-bold text-white">
                    {item.qty}
                    {item.isLargeTrade && (
                      <span className="text-[7px] text-amber-300 ml-0.5 font-sans font-bold">BIG</span>
                    )}
                  </span>
                  <span
                    className={`text-right text-[9px] font-bold ${
                      item.aggressor === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.aggressor === 'BUY' ? 'COMPRA' : 'VENDA'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS: REAL BROKER GATEWAY & RISK MANAGEMENT
         ========================================================================= */}
      {showRealBrokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Conexão API Corretora (Modo Real)</h3>
              </div>
              <button onClick={() => setShowRealBrokerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O DinhEuro suporta integração via API FIX/REST e WebSocket com as principais corretoras do Brasil e bolsas globais.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Selecione sua Corretora:</label>
                <select className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option>BTG Pactual Empresas / Digital</option>
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRealBrokerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Salvar Chave & Ativar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Gerenciador de Risco Diário</h3>
              </div>
              <button onClick={() => setShowRiskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Meta Diária de Ganho (Gain Goal):</label>
                <input
                  type="number"
                  value={dailyProfitGoal}
                  onChange={(e) => setDailyProfitGoal(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Limite Diário de Perda (Daily Stop Loss):</label>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm font-bold"
                />
              </div>

              {isRiskLocked && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Salvar Parâmetros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
