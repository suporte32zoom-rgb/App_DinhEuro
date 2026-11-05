import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  Filter,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Search,
  Info,
  Clock,
  BarChart3,
  Crosshair,
  Zap,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatCurrencyValue } from '../utils/finance';

interface TapeReadingAsset {
  symbol: string;
  name: string;
  type: string;
  tickSize: number;
  basePrice: number;
  unit: string;
}

const TAPE_ASSETS: TapeReadingAsset[] = [
  { symbol: 'WIN$', name: 'Mini Índice B3 (Futuro)', type: 'Futuros B3', tickSize: 5, basePrice: 129450, unit: 'pts' },
  { symbol: 'WDO$', name: 'Mini Dólar B3 (Futuro)', type: 'Futuros B3', tickSize: 0.5, basePrice: 5742.5, unit: 'pts' },
  { symbol: 'PETR4', name: 'Petrobras PN', type: 'Ação B3', tickSize: 0.01, basePrice: 38.65, unit: 'R$' },
  { symbol: 'VALE3', name: 'Vale ON', type: 'Ação B3', tickSize: 0.01, basePrice: 62.40, unit: 'R$' },
  { symbol: 'BTC/USD', name: 'Bitcoin Perpétuo', type: 'Cripto', tickSize: 1, basePrice: 87950, unit: '$' },
  { symbol: 'ETH/USD', name: 'Ethereum Perpétuo', type: 'Cripto', tickSize: 0.1, basePrice: 2280.5, unit: '$' },
];

const BROKERS_LIST = [
  'UBS',
  'Morgan Stanley',
  'BTG Pactual',
  'XP Investimentos',
  'Itaú BBA',
  'Bradesco',
  'Goldman Sachs',
  'Merrill Lynch',
  'Genial',
  'Santander',
  'Credit Suisse',
  'Clear',
];

interface DomLevel {
  price: number;
  bidQty: number;
  bidOrders: number;
  askQty: number;
  askOrders: number;
  bidVolPct: number;
  askVolPct: number;
  isPoc?: boolean;
}

interface TapeItem {
  id: string;
  time: string;
  price: number;
  qty: number;
  buyerBroker: string;
  sellerBroker: string;
  aggressor: 'BUY' | 'SELL';
  isLargeTrade: boolean;
}

interface BrokerPosition {
  broker: string;
  netQty: number;
  buyQty: number;
  sellQty: number;
  avgPrice: number;
  volPercent: number;
}

export const TapeReadingView: React.FC = () => {
  const { universalRates, displayCurrency } = useMarket();

  // Selected active asset
  const [selectedAsset, setSelectedAsset] = useState<TapeReadingAsset>(TAPE_ASSETS[0]);
  const [currentPrice, setCurrentPrice] = useState<number>(selectedAsset.basePrice);
  const [priceChange, setPriceChange] = useState<number>(+0.42);

  // Streaming control
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);
  const [minTradeFilter, setMinTradeFilter] = useState<number>(0);
  const [brokerFilter, setBrokerFilter] = useState<string>('ALL');

  // Tape and DOM state
  const [tapeData, setTapeData] = useState<TapeItem[]>([]);
  const [domLevels, setDomLevels] = useState<DomLevel[]>([]);
  const [cvdValue, setCvdValue] = useState<number>(1420); // Cumulative Volume Delta
  const [totalBuyVol, setTotalBuyVol] = useState<number>(45800);
  const [totalSellVol, setTotalSellVol] = useState<number>(39200);

  // Interactive quick notification
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Generate initial DOM levels centered on current price
  useEffect(() => {
    setCurrentPrice(selectedAsset.basePrice);
    const tick = selectedAsset.tickSize;
    const center = selectedAsset.basePrice;
    const levelsCount = 14;

    const newDom: DomLevel[] = [];
    let maxVol = 1;

    for (let i = levelsCount; i >= -levelsCount; i--) {
      const price = Number((center + i * tick).toFixed(selectedAsset.tickSize < 1 ? 2 : 1));
      const isAsk = i > 0;
      const isBid = i < 0;
      const isCurrent = i === 0;

      // Realistic volumes with peak at certain cluster zones
      const bidBase = isBid ? Math.floor(Math.random() * 400 + 40) : (isCurrent ? Math.floor(Math.random() * 80 + 10) : 0);
      const askBase = isAsk ? Math.floor(Math.random() * 400 + 40) : (isCurrent ? Math.floor(Math.random() * 80 + 10) : 0);

      const bidQty = bidBase;
      const askQty = askBase;
      if (bidQty > maxVol) maxVol = bidQty;
      if (askQty > maxVol) maxVol = askQty;

      newDom.push({
        price,
        bidQty,
        bidOrders: bidQty > 0 ? Math.max(1, Math.floor(bidQty / 15)) : 0,
        askQty,
        askOrders: askQty > 0 ? Math.max(1, Math.floor(askQty / 15)) : 0,
        bidVolPct: 0,
        askVolPct: 0,
        isPoc: i === -2, // POC near center
      });
    }

    const calculatedDom = newDom.map((item) => ({
      ...item,
      bidVolPct: Math.min(100, Math.round((item.bidQty / maxVol) * 100)),
      askVolPct: Math.min(100, Math.round((item.askQty / maxVol) * 100)),
    }));

    setDomLevels(calculatedDom);

    // Initial tape trades
    const initialTrades: TapeItem[] = [];
    const now = Date.now();
    for (let j = 0; j < 35; j++) {
      const isBuy = Math.random() > 0.48;
      const qty = Math.random() > 0.85 ? Math.floor(Math.random() * 80 + 50) : Math.floor(Math.random() * 20 + 1);
      const bBroker = BROKERS_LIST[Math.floor(Math.random() * BROKERS_LIST.length)];
      let sBroker = BROKERS_LIST[Math.floor(Math.random() * BROKERS_LIST.length)];
      if (sBroker === bBroker) sBroker = 'BTG Pactual';

      const tradeTime = new Date(now - j * 750);
      const timeStr = tradeTime.toLocaleTimeString('pt-BR', { hour12: false }) + '.' + String(tradeTime.getMilliseconds()).padStart(3, '0');

      initialTrades.push({
        id: 'trade-' + j + '-' + now,
        time: timeStr,
        price: Number((center + (Math.random() - 0.5) * tick * 2).toFixed(selectedAsset.tickSize < 1 ? 2 : 1)),
        qty,
        buyerBroker: bBroker,
        sellerBroker: sBroker,
        aggressor: isBuy ? 'BUY' : 'SELL',
        isLargeTrade: qty >= 50,
      });
    }
    setTapeData(initialTrades);
  }, [selectedAsset]);

  // Real-time ticking stream
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(200, Math.floor(900 / speedMultiplier));
    const interval = setInterval(() => {
      // 1. Determine trade event
      const isAggressorBuy = Math.random() > 0.47;
      const isLargeTrade = Math.random() > 0.88;
      const qty = isLargeTrade
        ? Math.floor(Math.random() * 120 + 60)
        : Math.floor(Math.random() * 25 + 1);

      // Price nudge
      const tick = selectedAsset.tickSize;
      const priceDelta = (Math.random() > 0.55 ? 1 : -1) * (Math.random() > 0.75 ? tick : 0);
      const newPrice = Number((currentPrice + priceDelta).toFixed(selectedAsset.tickSize < 1 ? 2 : 1));
      setCurrentPrice(newPrice);

      // Broker pair
      const bBroker = BROKERS_LIST[Math.floor(Math.random() * BROKERS_LIST.length)];
      let sBroker = BROKERS_LIST[Math.floor(Math.random() * BROKERS_LIST.length)];
      if (sBroker === bBroker) sBroker = 'Goldman Sachs';

      const now = new Date();
      const timeStr =
        now.toLocaleTimeString('pt-BR', { hour12: false }) +
        '.' +
        String(now.getMilliseconds()).padStart(3, '0');

      const newTrade: TapeItem = {
        id: 'trade-' + Date.now() + '-' + Math.random(),
        time: timeStr,
        price: newPrice,
        qty,
        buyerBroker: bBroker,
        sellerBroker: sBroker,
        aggressor: isAggressorBuy ? 'BUY' : 'SELL',
        isLargeTrade,
      };

      // Add to tape
      setTapeData((prev) => [newTrade, ...prev.slice(0, 50)]);

      // Update CVD and Aggression totals
      setCvdValue((prev) => prev + (isAggressorBuy ? qty : -qty));
      if (isAggressorBuy) {
        setTotalBuyVol((prev) => prev + qty);
      } else {
        setTotalSellVol((prev) => prev + qty);
      }

      // Update DOM micro volumes
      setDomLevels((prevLevels) => {
        return prevLevels.map((lvl) => {
          if (Math.abs(lvl.price - newPrice) < tick * 0.1) {
            // Price hit
            return {
              ...lvl,
              bidQty: isAggressorBuy ? Math.max(0, lvl.bidQty - Math.floor(qty * 0.3)) : lvl.bidQty + Math.floor(qty * 0.2),
              askQty: !isAggressorBuy ? Math.max(0, lvl.askQty - Math.floor(qty * 0.3)) : lvl.askQty + Math.floor(qty * 0.2),
            };
          }
          return lvl;
        });
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, currentPrice, selectedAsset]);

  // Filtered Tape trades
  const filteredTape = useMemo(() => {
    return tapeData.filter((item) => {
      if (minTradeFilter > 0 && item.qty < minTradeFilter) return false;
      if (brokerFilter !== 'ALL') {
        if (item.buyerBroker !== brokerFilter && item.sellerBroker !== brokerFilter) return false;
      }
      return true;
    });
  }, [tapeData, minTradeFilter, brokerFilter]);

  // Broker net position tracking (Institutional Player Ranking)
  const brokerRankings = useMemo<BrokerPosition[]>(() => {
    const map = new Map<string, { buy: number; sell: number; totalNotional: number }>();

    BROKERS_LIST.forEach((b) => map.set(b, { buy: 0, sell: 0, totalNotional: 0 }));

    tapeData.forEach((t) => {
      const bObj = map.get(t.buyerBroker);
      if (bObj) {
        bObj.buy += t.qty;
        bObj.totalNotional += t.qty * t.price;
      }
      const sObj = map.get(t.sellerBroker);
      if (sObj) {
        sObj.sell += t.qty;
        sObj.totalNotional += t.qty * t.price;
      }
    });

    const totalAllVol = tapeData.reduce((acc, curr) => acc + curr.qty, 0) || 1;

    const list: BrokerPosition[] = [];
    map.forEach((val, broker) => {
      const net = val.buy - val.sell;
      const totalBrokerVol = val.buy + val.sell;
      const avg = totalBrokerVol > 0 ? val.totalNotional / totalBrokerVol : currentPrice;
      list.push({
        broker,
        netQty: net,
        buyQty: val.buy,
        sellQty: val.sell,
        avgPrice: avg,
        volPercent: Math.min(100, Math.round((totalBrokerVol / totalAllVol) * 100)),
      });
    });

    // Sort by largest absolute net positioning
    return list.sort((a, b) => Math.abs(b.netQty) - Math.abs(a.netQty));
  }, [tapeData, currentPrice]);

  // Aggression imbalance percentage
  const totalVol = totalBuyVol + totalSellVol || 1;
  const buyRatio = Math.round((totalBuyVol / totalVol) * 100);
  const sellRatio = 100 - buyRatio;

  // Format price helper
  const formatPrice = (val: number) => {
    if (selectedAsset.tickSize < 1) {
      return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  };

  const handleDomClick = (price: number, side: 'BUY' | 'SELL') => {
    const action = side === 'BUY' ? 'Ordem de Compra Limitada' : 'Ordem de Venda Limitada';
    setLastNotification(`${action} enviada em ${formatPrice(price)} ${selectedAsset.unit}`);
    setTimeout(() => setLastNotification(null), 3500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Asset Selector & Live Tape Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070e1a] border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Asset Selection Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Layers className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Terminal de Fluxo & Tape Reading
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-mono-numbers font-bold">
                  DOM v2.5
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Análise de microestrutura de mercado, livro de profundidade (DOM) e rastreamento de grandes players institucionais em tempo real.
            </p>

            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar py-1">
              {TAPE_ASSETS.map((asset) => {
                const isSelected = selectedAsset.symbol === asset.symbol;
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{asset.symbol}</span>
                    <span className="text-[10px] opacity-70 font-normal">({asset.type})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Microstructure Metric Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
            {/* Current Price */}
            <div className="pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium block">Último Preço</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-xs text-slate-400">{selectedAsset.unit}</span>
              </div>
            </div>

            {/* CVD Delta Acumulado */}
            <div className="pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium block">Delta Acumulado (CVD)</span>
              <div
                className={`text-sm sm:text-base font-bold font-mono-numbers flex items-center gap-1 ${
                  cvdValue >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {cvdValue >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {cvdValue >= 0 ? '+' : ''}
                {cvdValue.toLocaleString('pt-BR')} lotes
              </div>
            </div>

            {/* Aggressor Ratio Bar */}
            <div className="min-w-[150px]">
              <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                <span className="text-emerald-400">Compra {buyRatio}%</span>
                <span className="text-rose-400">Venda {sellRatio}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${buyRatio}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${sellRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Notification */}
        {lastNotification && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
            <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{lastNotification}</span>
          </div>
        )}
      </div>

      {/* Control Tool Strip */}
      <div className="rounded-xl bg-[#09111e] border border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar Fita
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Retomar Fluxo
              </>
            )}
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound trigger */}
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            title="Feedback sonoro de agressão"
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              audioFeedback
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {audioFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Lot Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Lote Mín:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {[0, 10, 50, 100].map((filt) => (
                <button
                  key={filt}
                  onClick={() => setMinTradeFilter(filt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    minTradeFilter === filt
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filt === 0 ? 'Todos' : `≥ ${filt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Broker Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">Corretora:</span>
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              aria-label="Filtrar fita de negócios por corretora"
              className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas as Corretoras</option>
              {BROKERS_LIST.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: DOM Book + Times & Trades + Player Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Module 1: DOM (Depth of Market) - 5 Cols */}
        <div className="lg:col-span-5 rounded-2xl bg-[#09111e] border border-slate-800 p-4 shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Livro de Profundidade (DOM)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {domLevels.length} Níveis
            </span>
          </div>

          {/* DOM Header Columns */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase py-1 px-1 bg-slate-900/60 rounded-lg mb-1">
            <div className="col-span-2 text-left pl-1">Ordens</div>
            <div className="col-span-3 text-right text-emerald-400">Bid (Compra)</div>
            <div className="col-span-2 text-center text-slate-200">Preço</div>
            <div className="col-span-3 text-left text-rose-400 pl-2">Ask (Venda)</div>
            <div className="col-span-2 text-right pr-1">Ordens</div>
          </div>

          {/* DOM Interactive Rows */}
          <div className="flex-1 overflow-y-auto space-y-0.5 no-scrollbar pr-0.5 text-xs font-mono-numbers">
            {domLevels.map((lvl) => {
              const isCurrent = Math.abs(lvl.price - currentPrice) < selectedAsset.tickSize * 0.1;
              return (
                <div
                  key={lvl.price}
                  className={`grid grid-cols-12 items-center py-1 px-1 rounded transition group cursor-pointer relative ${
                    isCurrent
                      ? 'bg-amber-500/20 border border-amber-500/50 shadow-inner'
                      : lvl.isPoc
                      ? 'bg-indigo-950/40 border border-indigo-700/40'
                      : 'hover:bg-slate-800/60'
                  }`}
                  onClick={() => handleDomClick(lvl.price, lvl.price <= currentPrice ? 'BUY' : 'SELL')}
                >
                  {/* Bid Orders */}
                  <div className="col-span-2 text-[10px] text-slate-500 pl-1">
                    {lvl.bidOrders > 0 ? lvl.bidOrders : ''}
                  </div>

                  {/* Bid Volume with Fill Bar */}
                  <div className="col-span-3 text-right pr-2 relative">
                    {lvl.bidQty > 0 && (
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-emerald-500/20 rounded pointer-events-none transition-all"
                        style={{ width: `${lvl.bidVolPct}%` }}
                      />
                    )}
                    <span className="relative z-10 text-emerald-300 font-semibold">
                      {lvl.bidQty > 0 ? lvl.bidQty.toLocaleString('pt-BR') : ''}
                    </span>
                  </div>

                  {/* Price Level */}
                  <div
                    className={`col-span-2 text-center font-bold rounded py-0.5 ${
                      isCurrent
                        ? 'text-amber-300 bg-amber-500/30'
                        : lvl.isPoc
                        ? 'text-indigo-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {formatPrice(lvl.price)}
                    {lvl.isPoc && (
                      <span className="block text-[8px] uppercase tracking-widest text-indigo-400 font-sans font-black">
                        POC
                      </span>
                    )}
                  </div>

                  {/* Ask Volume with Fill Bar */}
                  <div className="col-span-3 text-left pl-2 relative">
                    {lvl.askQty > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-rose-500/20 rounded pointer-events-none transition-all"
                        style={{ width: `${lvl.askVolPct}%` }}
                      />
                    )}
                    <span className="relative z-10 text-rose-300 font-semibold">
                      {lvl.askQty > 0 ? lvl.askQty.toLocaleString('pt-BR') : ''}
                    </span>
                  </div>

                  {/* Ask Orders */}
                  <div className="col-span-2 text-[10px] text-slate-500 text-right pr-1">
                    {lvl.askOrders > 0 ? lvl.askOrders : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Order Buttons at Footer */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDomClick(currentPrice, 'BUY')}
              className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Comprar a Mercado
            </button>
            <button
              onClick={() => handleDomClick(currentPrice, 'SELL')}
              className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-rose-950 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDownRight className="w-3.5 h-3.5" /> Vender a Mercado
            </button>
          </div>
        </div>

        {/* Module 2: Times & Trades (Fita de Negócios) - 4 Cols */}
        <div className="lg:col-span-4 rounded-2xl bg-[#09111e] border border-slate-800 p-4 shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Times & Trades (Fita)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {filteredTape.length} Negócios
            </span>
          </div>

          {/* Tape Header Columns */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase py-1 px-1 bg-slate-900/60 rounded-lg mb-1">
            <div className="col-span-3 text-left">Hora</div>
            <div className="col-span-3 text-center">Preço</div>
            <div className="col-span-2 text-right">Lote</div>
            <div className="col-span-2 text-center text-emerald-400">Comprador</div>
            <div className="col-span-2 text-center text-rose-400">Vendedor</div>
          </div>

          {/* Tape Stream Items */}
          <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pr-0.5 text-xs font-mono-numbers">
            {filteredTape.map((trade) => {
              const isBuy = trade.aggressor === 'BUY';
              return (
                <div
                  key={trade.id}
                  className={`grid grid-cols-12 items-center py-1.5 px-1.5 rounded transition border ${
                    trade.isLargeTrade
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : isBuy
                      ? 'bg-emerald-950/20 border-emerald-900/30'
                      : 'bg-rose-950/20 border-rose-900/30'
                  }`}
                >
                  {/* Time */}
                  <div className="col-span-3 text-[10px] text-slate-400 truncate">
                    {trade.time}
                  </div>

                  {/* Price */}
                  <div
                    className={`col-span-3 text-center font-bold ${
                      isBuy ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPrice(trade.price)}
                  </div>

                  {/* Quantity with Large Trade Badge */}
                  <div className="col-span-2 text-right font-bold text-white">
                    {trade.qty}
                    {trade.isLargeTrade && (
                      <span className="block text-[8px] text-amber-300 font-sans uppercase font-bold">
                        BIG
                      </span>
                    )}
                  </div>

                  {/* Buyer Broker */}
                  <div className="col-span-2 text-center text-[10px] text-slate-300 truncate px-0.5">
                    {trade.buyerBroker}
                  </div>

                  {/* Seller Broker */}
                  <div className="col-span-2 text-center text-[10px] text-slate-400 truncate px-0.5">
                    {trade.sellerBroker}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend Footnote */}
          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Agressor Comprador
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Agressor Vendedor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Lote Institucional
            </span>
          </div>
        </div>

        {/* Module 3: Ranking de Corretoras (Player Tracking) - 3 Cols */}
        <div className="lg:col-span-3 rounded-2xl bg-[#09111e] border border-slate-800 p-4 shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Saldo de Players
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">Institucional</span>
          </div>

          {/* Ranking Header */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase py-1 px-1 bg-slate-900/60 rounded-lg mb-1">
            <div className="col-span-5 text-left">Corretora</div>
            <div className="col-span-4 text-right">Saldo Líq.</div>
            <div className="col-span-3 text-right">Vol %</div>
          </div>

          {/* Ranking List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar pr-0.5 text-xs font-mono-numbers">
            {brokerRankings.map((b) => {
              const isLong = b.netQty >= 0;
              return (
                <div
                  key={b.broker}
                  className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-5 text-[11px] font-bold text-white truncate">
                      {b.broker}
                    </div>
                    <div
                      className={`col-span-4 text-right font-bold text-xs ${
                        isLong ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isLong ? '+' : ''}
                      {b.netQty.toLocaleString('pt-BR')}
                    </div>
                    <div className="col-span-3 text-right text-[11px] text-slate-400">
                      {b.volPercent}%
                    </div>
                  </div>

                  {/* Buy / Sell Mini Bar */}
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">{b.buyQty} C</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-rose-400 font-semibold">{b.sellQty} V</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Quick Note */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Saldo positivo indica absorção compradora de tesourarias e fundos; saldo negativo indica posicionamento vendido.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Tape Reading Foundation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#09111e] border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Zap className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Absorção de Liquidez
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ocorre quando grandes ordens passivas no livro absorvem agressões repetidas no mesmo patamar sem que o preço rompa o nível, sinalizando defesa institucional.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#09111e] border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Flame className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ordens Iceberg (Ocultas)
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ordens institucionais fracionadas que mostram apenas uma parcela mínima no book visual. Identificadas pelo preenchimento contínuo de lotes em agressões sem variação de preço.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#09111e] border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <Crosshair className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              CVD & Desbalanceamento
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            O Delta Acumulado (CVD) mede a diferença líquida de contratos agredidos na compra vs na venda. Divergências entre o preço e o CVD antecipam reversões de tendência.
          </p>
        </div>
      </div>
    </div>
  );
};
