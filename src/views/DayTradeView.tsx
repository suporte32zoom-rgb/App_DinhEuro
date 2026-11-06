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
  Trophy,
  User,
  LogOut,
  Maximize2,
  Crosshair,
  PenTool,
  CandlestickChart,
  LineChart,
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

export interface AuthUserProfile {
  name: string;
  role: string;
  accountNumber: string;
  accountType: string;
  email: string;
  phone?: string;
  isGuest: boolean;
}

const DEFAULT_AUTH_USER: AuthUserProfile = {
  name: 'Tarciano Sousa',
  role: 'Trader Profissional',
  accountNumber: '49281-B3',
  accountType: 'Simulação Pro Institucional',
  email: 'tarciano.sousa@dinheuro.com',
  phone: '+55 (11) 98765-4321',
  isGuest: false,
};

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

  // Authentication State (stored in localStorage)
  const [authUser, setAuthUser] = useState<AuthUserProfile>(() => {
    if (typeof window === 'undefined') return DEFAULT_AUTH_USER;
    try {
      const saved = localStorage.getItem('dinheuro_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_AUTH_USER;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'profile'>('profile');
  const [loginEmail, setLoginEmail] = useState<string>('tarciano.sousa@dinheuro.com');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');
  const [registerName, setRegisterName] = useState<string>('Tarciano Sousa');
  const [registerEmail, setRegisterEmail] = useState<string>('tarciano@dinheuro.com');
  const [registerPhone, setRegisterPhone] = useState<string>('(11) 98765-4321');
  const [registerPassword, setRegisterPassword] = useState<string>('');

  // Curated list of high-liquidity assets for Day Trading dynamically connected to live assets
  const dayTradeAssets = useMemo(() => {
    const ibov = assets.find((a) => a.symbol === 'IBOVESPA');
    const usdBrl = assets.find((a) => a.symbol === 'USD/BRL');

    const winPrice = ibov ? Math.round(ibov.price / 5) * 5 : 116480;
    const winChange = ibov ? ibov.change24h : 0.23;
    const winHigh = ibov ? Math.round(ibov.high24h / 5) * 5 : 116550;
    const winLow = ibov ? Math.round(ibov.low24h / 5) * 5 : 116070;
    const winSpark = ibov?.sparkline?.length
      ? ibov.sparkline.map((v) => Math.round(v / 5) * 5)
      : [116100, 116250, 116380, 116480];

    const wdoPrice = usdBrl ? Number((usdBrl.price * 1000).toFixed(1)) : 5053.5;
    const wdoChange = usdBrl ? usdBrl.change24h : -0.31;
    const wdoHigh = usdBrl ? Number((usdBrl.high24h * 1000).toFixed(1)) : 5075.0;
    const wdoLow = usdBrl ? Number((usdBrl.low24h * 1000).toFixed(1)) : 5042.0;
    const wdoSpark = usdBrl?.sparkline?.length
      ? usdBrl.sparkline.map((v) => Number((v * 1000).toFixed(1)))
      : [5068, 5062, 5058, 5053.5];

    const customList = [
      {
        id: 'win_fut',
        symbol: 'WINFUT',
        name: 'Mini Índice B3 Futuro',
        category: 'indices',
        price: winPrice,
        currency: 'BRL',
        change24h: winChange,
        changeValue: Number(((winPrice * winChange) / 100).toFixed(0)),
        high24h: winHigh,
        low24h: winLow,
        volume: '5.4M',
        sparkline: winSpark,
        flag: '🇧🇷',
        tickSize: 5,
        tickValue: 1.0,
        type: 'Futuros',
      },
      {
        id: 'wdo_fut',
        symbol: 'WDOFUT',
        name: 'Mini Dólar B3 Futuro',
        category: 'forex',
        price: wdoPrice,
        currency: 'BRL',
        change24h: wdoChange,
        changeValue: Number(((wdoPrice * wdoChange) / 100).toFixed(1)),
        high24h: wdoHigh,
        low24h: wdoLow,
        volume: '1.8M',
        sparkline: wdoSpark,
        flag: '🇧🇷',
        tickSize: 0.5,
        tickValue: 5.0,
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
  const [chartInterval, setChartInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('15m');

  // Indicator Toggles
  const [showMA9, setShowMA9] = useState<boolean>(true);
  const [showMA21, setShowMA21] = useState<boolean>(true);
  const [showMA200, setShowMA200] = useState<boolean>(true);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Market Watch Tab in Right Column (Ações, Futuros, Forex, Cripto, BDRs)
  const [marketWatchCategory, setMarketWatchCategory] = useState<'Ações' | 'Futuros' | 'Forex' | 'Cripto' | 'BDRs'>('Ações');
  const [marketWatchSearch, setMarketWatchSearch] = useState<string>('');

  // Modals
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);

  // Risk Management State
  const [dailyProfitGoal, setDailyProfitGoal] = useState<number>(2000); // R$ 2.000
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000); // R$ 1.000
  const [isRiskLocked, setIsRiskLocked] = useState<boolean>(false);

  // Paper Trading Account
  const [accountBalance, setAccountBalance] = useState<number>(100000); // R$ 100.000,00
  const [realizedPnl, setRealizedPnl] = useState<number>(865); // R$ 865,00 as shown in reference
  const [sessionStartTime] = useState<Date>(new Date(Date.now() - 3 * 3600 * 1000 - 24 * 60 * 1000));
  const [sessionTimer, setSessionTimer] = useState<string>('3h 24min');

  // Default initial open positions faithful to the reference screenshot
  const [positions, setPositions] = useState<DayTradePosition[]>([
    {
      id: 'pos_1',
      symbol: 'WINFUT',
      name: 'Mini Índice B3',
      side: 'BUY',
      contracts: 1,
      entryPrice: 116120,
      currentPrice: 116480,
      openTime: '14:22:10',
    },
    {
      id: 'pos_2',
      symbol: 'WDOFUT',
      name: 'Mini Dólar B3',
      side: 'SELL',
      contracts: 1,
      entryPrice: 5061.0,
      currentPrice: 5053.5,
      openTime: '14:38:45',
    },
    {
      id: 'pos_3',
      symbol: 'PETR4',
      name: 'Petrobras PN',
      side: 'BUY',
      contracts: 100,
      entryPrice: 34.70,
      currentPrice: 35.42,
      openTime: '14:45:12',
    },
  ]);

  const [closedTrades, setClosedTrades] = useState<DayTradeClosedTrade[]>([
    {
      id: 'cl_1',
      symbol: 'WINFUT',
      side: 'BUY',
      contracts: 2,
      entryPrice: 116200,
      exitPrice: 116450,
      pnlBrl: 100,
      pnlUsd: 18.2,
      closeTime: '13:50:00',
    },
    {
      id: 'cl_2',
      symbol: 'VALE3',
      side: 'BUY',
      contracts: 100,
      entryPrice: 63.80,
      exitPrice: 64.80,
      pnlBrl: 100,
      pnlUsd: 18.2,
      closeTime: '14:15:30',
    },
  ]);

  // Order Ticket State
  const [orderTicketTab, setOrderTicketTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [contracts, setContracts] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(currentAsset.price);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Live price & tick state
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(currentAsset.price);

  // Live clock and date
  const [liveClockTime, setLiveClockTime] = useState<string>('15:42:31');
  const [liveDateString, setLiveDateString] = useState<string>('26/10/2023');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClockTime(now.toLocaleTimeString('pt-BR', { hour12: false }));
      setLiveDateString(now.toLocaleDateString('pt-BR'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize price when asset changes
  useEffect(() => {
    setCurrentMarketPrice(currentAsset.price);
    setLimitPrice(currentAsset.price);
  }, [currentAsset]);

  // Calculate live floating PnL
  const floatingPnlBrl = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const isWin = pos.symbol === 'WINFUT';
      const isWdo = pos.symbol === 'WDOFUT';
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

  const totalDayPnl = realizedPnl + Math.round(floatingPnlBrl > 0 ? floatingPnlBrl : 0);

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

  // Order Execution Functions
  const handleExecuteOrder = (side: 'BUY' | 'SELL') => {
    if (isRiskLocked) {
      setOrderNotification('❌ Trava de risco ativa! Limite de perda diário atingido.');
      setTimeout(() => setOrderNotification(null), 4000);
      return;
    }

    const price = orderType === 'MARKET' ? currentMarketPrice : limitPrice;

    const newPosition: DayTradePosition = {
      id: `pos_${Date.now()}`,
      symbol: currentAsset.symbol,
      name: currentAsset.name,
      side,
      contracts,
      entryPrice: price,
      currentPrice: price,
      openTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setPositions((prev) => [...prev, newPosition]);
    setOrderNotification(
      `✓ Ordem de ${side === 'BUY' ? 'COMPRA' : 'VENDA'} executada: ${contracts}x ${currentAsset.symbol} a ${formatCurrencyValue(price, currentAsset.currency)}`
    );
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const handleCloseAllPositions = (reason?: string) => {
    if (positions.length === 0) {
      setOrderNotification('Nenhuma posição aberta para zerar.');
      setTimeout(() => setOrderNotification(null), 2500);
      return;
    }

    let batchPnl = 0;
    const newClosed: DayTradeClosedTrade[] = [];

    positions.forEach((pos) => {
      const isWin = pos.symbol === 'WINFUT';
      const isWdo = pos.symbol === 'WDOFUT';
      const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;

      let pnl = isWin ? diff * 0.2 * pos.contracts : isWdo ? diff * 10 * pos.contracts : diff * pos.contracts;
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

    setOrderNotification(
      reason || `Todas as posições foram zeradas a mercado! P&L consolidado: ${batchPnl >= 0 ? '+' : ''}${formatCurrencyValue(batchPnl, 'BRL')}`
    );
    setTimeout(() => setOrderNotification(null), 3500);
  };

  const handleResetSimulator = () => {
    setAccountBalance(100000);
    setRealizedPnl(865);
    setIsRiskLocked(false);
    setOrderNotification('Simulador reiniciado com sucesso! Saldo restaurado para R$ 100.000,00.');
    setTimeout(() => setOrderNotification(null), 3000);
  };

  // Global top 5 continuous tickers matching reference image exactly
  const macroTickers = useMemo(() => {
    const getAsset = (sym: string) =>
      assets.find(
        (a) =>
          a.symbol.toLowerCase() === sym.toLowerCase() ||
          a.id.toLowerCase() === sym.toLowerCase() ||
          a.name.toLowerCase().includes(sym.toLowerCase())
      );

    const ibov = getAsset('IBOVESPA');
    const usdBrl = getAsset('USD/BRL');
    const eurBrl = getAsset('EUR/BRL');
    const sp500 = getAsset('S&P 500');
    const btc = getAsset('BTC/USD');

    return [
      {
        symbol: 'IBOVESPA',
        label: 'IBOV',
        price: ibov ? ibov.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '116.738,12',
        change: ibov ? ibov.change24h : +1.35,
        sparkPoints: '0,18 8,14 16,16 24,11 32,13 40,8 48,10 56,5 64,7 72,2 80,4',
      },
      {
        symbol: 'USD/BRL',
        label: 'DÓLAR (USD/BRL)',
        price: usdBrl ? usdBrl.price.toFixed(4).replace('.', ',') : '5,0535',
        change: usdBrl ? usdBrl.change24h : -0.31,
        sparkPoints: '0,4 8,7 16,5 24,9 32,8 40,12 48,11 56,15 64,13 72,18 80,16',
      },
      {
        symbol: 'EUR/BRL',
        label: 'EURO (EUR/BRL)',
        price: eurBrl ? eurBrl.price.toFixed(4).replace('.', ',') : '5,3573',
        change: eurBrl ? eurBrl.change24h : -0.15,
        sparkPoints: '0,6 8,8 16,6 24,10 32,9 40,11 48,12 56,14 64,13 72,16 80,15',
      },
      {
        symbol: 'S&P 500',
        label: 'S&P 500',
        price: sp500 ? sp500.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '4.195,15',
        change: sp500 ? sp500.change24h : +0.85,
        sparkPoints: '0,16 8,14 16,12 24,14 32,10 40,8 48,9 56,6 64,7 72,3 80,2',
      },
      {
        symbol: 'BTC/USD',
        label: 'BTC/USD',
        price: btc ? `$ ${btc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '172.235,50',
        change: btc ? btc.change24h : +3.40,
        sparkPoints: '0,18 8,15 16,14 24,11 32,12 40,7 48,8 56,4 64,5 72,2 80,1',
      },
    ];
  }, [assets]);

  // Market Watch list matching reference image
  const marketWatchItems = useMemo(() => {
    return [
      { symbol: 'PETR4', price: '35,42', change: '+2,11%', isPos: true, vol: '1.2M' },
      { symbol: 'VALE3', price: '64,80', change: '+0,95%', isPos: true, vol: '850K' },
      { symbol: 'ITUB4', price: '28,15', change: '-0,35%', isPos: false, vol: '620K' },
      { symbol: 'BBDC4', price: '14,20', change: '+1,12%', isPos: true, vol: '450K' },
      { symbol: 'BBAS3', price: '48,90', change: '+1,45%', isPos: true, vol: '380K' },
      { symbol: 'MGLU3', price: '2,15', change: '-2,27%', isPos: false, vol: '910K' },
      { symbol: 'WINFUT', price: '116.480', change: '+0,23%', isPos: true, vol: '5.4M' },
      { symbol: 'WDOFUT', price: '5.053,5', change: '-0,31%', isPos: false, vol: '1.8M' },
    ];
  }, []);

  // Left sidebar navigation items definition
  const sidebarNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home, active: true, action: () => setActiveTab('dashboard') },
    { id: 'mercados', label: 'Mercados', icon: Globe, active: false, action: () => setActiveTab('mercados') },
    { id: 'graficos', label: 'Gráficos Avançados', icon: BarChart3, active: false, action: () => setActiveTab('graficos') },
    { id: 'ordens', label: 'Ordens', icon: FileText, active: false, action: () => setActiveCenterTab('book') },
    { id: 'posicoes', label: 'Posições', icon: Activity, active: false, action: () => {} },
    { id: 'carteira', label: 'Carteira', icon: Briefcase, active: false, action: () => setActiveTab('carteiras') },
    { id: 'analises', label: 'Análises', icon: Sparkles, active: false, action: () => setActiveCenterTab('indicators') },
    { id: 'noticias', label: 'Notícias', icon: Newspaper, active: false, action: () => setActiveTab('noticias') },
    { id: 'alertas', label: 'Alertas', icon: Bell, active: false, action: () => setShowAlertModal(true) },
    { id: 'estrategias', label: 'Estratégias', icon: Target, active: false, action: () => setActiveCenterTab('strategies') },
    { id: 'simulador', label: 'Simulador', icon: PlayCircle, active: false, action: handleResetSimulator },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, active: false, action: () => setShowRiskModal(true) },
    { id: 'ajuda', label: 'Ajuda', icon: HelpCircle, active: false, action: () => setShowHelpModal(true) },
  ];

  const handleSaveAuthUser = (newUser: AuthUserProfile) => {
    setAuthUser(newUser);
    try {
      localStorage.setItem('dinheuro_auth_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
    setShowAuthModal(false);
    setOrderNotification(`Sessão iniciada como ${newUser.name} (${newUser.role})`);
    setTimeout(() => setOrderNotification(null), 3500);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#070d18] text-slate-100 select-none overflow-hidden text-xs">
      {/* =========================================================================
          1. TOP INSTITUTIONAL HEADER (EXACT REPLICA OF REFERENCE IMAGE)
         ========================================================================= */}
      <header className="bg-[#050a14] border-b border-slate-800/90 px-3 py-1.5 flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand + Day Trade Pro Title + Slogan */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
            title="Ir para Home DinhEuro"
          >
            {/* DinhEuro Signal Bars Logo */}
            <div className="flex items-end gap-0.5 h-5">
              <span className="w-1 h-2.5 bg-cyan-400 rounded-xs group-hover:scale-y-110 transition-transform" />
              <span className="w-1 h-3.5 bg-blue-500 rounded-xs group-hover:scale-y-110 transition-transform" />
              <span className="w-1 h-5 bg-indigo-500 rounded-xs group-hover:scale-y-110 transition-transform" />
            </div>
            <span className="text-base font-black tracking-tight text-white font-sans">
              Dinh<span className="text-cyan-400">Euro</span>
            </span>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-wide leading-none">
              Day Trade Pro
            </h1>
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Negocie com inteligência. Opere com confiança.
            </span>
          </div>
        </div>

        {/* Right: Ao Vivo Badge + Live Clock + Notifications + Trader Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Ao Vivo Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">Ao Vivo</span>
          </div>

          {/* Clock & Date */}
          <div className="hidden sm:flex flex-col text-right font-mono-numbers">
            <span className="text-xs font-bold text-white leading-tight">{liveClockTime}</span>
            <span className="text-[9px] text-slate-400 leading-none">{liveDateString}</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setShowAlertModal(true)}
            className="relative p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            title="Notificações do Terminal"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* User Profile Pill (Tarciano Sousa - Trader Profissional) */}
          <div
            onClick={() => {
              setAuthModalTab('profile');
              setShowAuthModal(true);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            title="Gerenciar Conta / Perfil"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] font-black text-amber-300">TS</span>
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-950 rounded-full" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-white">{authUser.name}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{authUser.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. TOP MACRO TICKERS (5 DISTINCT CARDS HORIZONTALLY)
         ========================================================================= */}
      <div className="bg-[#050a14] border-b border-slate-800/80 px-2.5 py-1.5 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono-numbers">
          {macroTickers.map((t) => {
            const isPos = t.change >= 0;
            return (
              <div
                key={t.symbol}
                onClick={() => {
                  const match = dayTradeAssets.find((a) => a.symbol === t.symbol);
                  if (match) setSelectedSymbol(match.symbol);
                }}
                className="bg-[#09111e] hover:bg-[#0c1626] border border-slate-800/90 hover:border-slate-700 rounded-lg p-2 flex flex-col justify-between transition cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition">
                    {t.label}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      isPos ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {t.change.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <span className="text-sm font-black text-white tracking-tight">{t.price}</span>
                  {/* Inline Sparkline SVG */}
                  <svg className="w-16 h-4 overflow-visible" viewBox="0 0 80 20">
                    <polyline
                      fill="none"
                      stroke={isPos ? '#10b981' : '#ef4444'}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={t.sparkPoints}
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Order Notification */}
      {orderNotification && (
        <div className="bg-emerald-950/95 border-b border-emerald-500/70 text-emerald-200 px-3 py-1 text-xs flex items-center justify-between shadow-lg shrink-0 z-30">
          <span className="font-semibold">{orderNotification}</span>
          <button onClick={() => setOrderNotification(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          3. MAIN WORKSPACE (SIDEBAR + CENTER CHART + RIGHT WATCHLIST & BOLETA)
         ========================================================================= */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* =======================================================================
            3A. LEFT SIDEBAR MENU (140px with Home active + DinhEuro bottom promo)
           ======================================================================= */}
        <aside className="w-36 sm:w-40 bg-[#050a14] border-r border-slate-800/90 flex flex-col justify-between p-1.5 shrink-0 overflow-y-auto no-scrollbar">
          {/* Navigation Links */}
          <div className="space-y-0.5">
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Left: DinhEuro Institutional Promo Card */}
          <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-b from-[#0a1a36] to-[#071124] border border-cyan-500/30 flex flex-col items-center text-center shadow-lg">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-1">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-cyan-300 rounded-xs" />
                <span className="w-0.5 h-2 bg-blue-400 rounded-xs" />
                <span className="w-0.5 h-3 bg-indigo-400 rounded-xs" />
              </div>
            </div>
            <strong className="text-white text-xs font-black">DinhEuro</strong>
            <p className="text-[9px] text-slate-300 leading-tight mt-0.5 mb-2">
              Sua plataforma completa de Day Trade
            </p>
            <button
              type="button"
              onClick={() => handleExecuteOrder('BUY')}
              className="w-full py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition cursor-pointer shadow flex items-center justify-center gap-1"
            >
              <span>Operar Agora</span>
              <span>-&gt;</span>
            </button>
          </div>
        </aside>

        {/* =======================================================================
            3B. CENTER ANALYSIS WORKSPACE (TABS + TOOLBAR + CANDLESTICK CANVAS)
           ======================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col bg-[#070d18] overflow-hidden">
          {/* Top Functional Tabs */}
          <div className="bg-[#09111e] border-b border-slate-800 px-3 py-1 flex items-center gap-1 shrink-0">
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
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  activeCenterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Controls & Tools Bar */}
          <div className="bg-[#060c18] border-b border-slate-800/80 px-3 py-1 flex items-center justify-between gap-2 flex-wrap shrink-0">
            {/* Left: Asset Select Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  aria-label="Selecionar ativo"
                  className="bg-[#09111e] border border-slate-700 hover:border-blue-500 rounded px-2 pr-6 py-0.5 text-xs font-black text-white font-mono-numbers outline-none cursor-pointer"
                >
                  <option value="WINFUT">WINFUT</option>
                  <option value="WDOFUT">WDOFUT</option>
                  <option value="PETR4">PETR4</option>
                  <option value="VALE3">VALE3</option>
                  <option value="BTC/USD">BTC/USD</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="h-4 w-px bg-slate-800" />

              {/* Timeframes */}
              <div className="flex items-center gap-0.5 text-[10px] font-bold">
                {(['1m', '5m', '15m', '1h', '1D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartInterval(tf)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      chartInterval === tf
                        ? 'bg-blue-600 text-white font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Technical Drawing & Indicator Tool Icons */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setOrderNotification('Tipo de gráfico: Velas Japonesas')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Velas Japonesas (Candlesticks)"
              >
                <CandlestickChart className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                onClick={() => setOrderNotification('Tipo de gráfico: Linha')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Gráfico em Linha"
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveCenterTab('indicators')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Indicadores Técnicos (f(x))"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOrderNotification('Ferramenta de Linha de Tendência ativada')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Ferramenta de Desenho"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOrderNotification('Mira Crosshair ativada')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Crosshair"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowRiskModal(true)}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Configurações Gráficas"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOrderNotification('Tela cheia expandida')}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                title="Tela Cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Canvas Body (Candlestick Chart) */}
          <div className="flex-1 min-h-0 relative bg-[#070d18] overflow-hidden p-2">
            {activeCenterTab === 'chart' && (
              <div className="w-full h-full relative rounded-lg border border-slate-800/90 bg-[#060c18] overflow-hidden flex flex-col">
                {/* Chart Header Bar: Asset Summary & Moving Averages */}
                <div className="px-3 py-1.5 bg-[#08111e]/80 border-b border-slate-800/70 flex items-center justify-between text-[11px] font-mono-numbers shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">WINFUT • 15 • B3</span>
                    <span className="text-slate-400">
                      Abe <span className="text-white">116.210</span> Máx <span className="text-white">116.550</span> Mín <span className="text-white">116.070</span> Últ <span className="text-white font-bold">116.480</span>
                    </span>
                    <span className="text-emerald-400 font-bold">+0,23% (+270)</span>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-[10px]">
                    <span className="text-sky-400 font-bold">MA (9) close 116.350</span>
                    <span className="text-amber-400 font-bold">MA (21) close 116.280</span>
                    <span className="text-purple-400 font-bold">MA (200) close 116.120</span>
                  </div>
                </div>

                {/* SVG Candlestick Canvas */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
                    {/* Background Grid */}
                    <line x1="0" y1="60" x2="800" y2="60" stroke="#131e33" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="800" y2="120" stroke="#131e33" strokeDasharray="3 3" />
                    <line x1="0" y1="180" x2="800" y2="180" stroke="#131e33" strokeDasharray="3 3" />
                    <line x1="0" y1="240" x2="800" y2="240" stroke="#131e33" strokeDasharray="3 3" />

                    {/* Candlesticks & Volume */}
                    {Array.from({ length: 36 }).map((_, i) => {
                      const x = 18 + i * 21.2;
                      // Sequence to replicate the reference chart contour
                      const isUp = i >= 12 && i <= 28 ? (i % 3 !== 0) : (i % 2 === 0);
                      const baseCycle = Math.sin(i * 0.28) * 45;
                      const trendLift = i > 12 ? (i - 12) * 3.8 : -i * 2;
                      const open = 160 - baseCycle - trendLift;
                      const candleHeight = Math.max(6, Math.abs(Math.sin(i * 0.6)) * 26);
                      const close = isUp ? open - candleHeight : open + candleHeight;
                      const high = Math.min(open, close) - (Math.abs(Math.sin(i * 0.9)) * 14 + 4);
                      const low = Math.max(open, close) + (Math.abs(Math.cos(i * 0.9)) * 14 + 4);
                      const color = isUp ? '#10B981' : '#EF4444';
                      const volHeight = Math.abs(Math.sin(i * 0.45)) * 42 + 10;

                      return (
                        <g key={i}>
                          {/* Volume histogram at bottom */}
                          <rect
                            x={x}
                            y={310 - volHeight}
                            width="9.5"
                            height={volHeight}
                            fill={color}
                            opacity="0.45"
                            rx="1"
                          />
                          {/* Candle Wick */}
                          <line x1={x + 4.75} y1={high} x2={x + 4.75} y2={low} stroke={color} strokeWidth="1.2" />
                          {/* Candle Body */}
                          <rect
                            x={x}
                            y={Math.min(open, close)}
                            width="9.5"
                            height={Math.max(4, Math.abs(close - open))}
                            fill={color}
                            rx="1"
                          />
                        </g>
                      );
                    })}

                    {/* MA 9 Overlay (Cyan Curve) */}
                    <path
                      d="M 18 190 Q 200 215, 380 145 T 770 95"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                    />

                    {/* MA 21 Overlay (Amber/Orange Curve) */}
                    <path
                      d="M 18 180 Q 220 205, 410 155 T 770 108"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />

                    {/* MA 200 Overlay (Purple Curve) */}
                    <path
                      d="M 18 170 Q 240 180, 440 170 T 770 135"
                      fill="none"
                      stroke="#C084FC"
                      strokeWidth="2.2"
                    />

                    {/* Current Price Dashed Line & Badge */}
                    <line x1="0" y1="95" x2="800" y2="95" stroke="#10B981" strokeDasharray="4 3" strokeWidth="1.2" />
                  </svg>

                  {/* Right Price Scale & Current Tag */}
                  <div className="absolute top-0 right-0 bottom-8 w-16 border-l border-slate-800/80 bg-[#060c18]/85 flex flex-col justify-between py-2 text-[10px] font-mono-numbers text-slate-400 text-right pr-1 select-none pointer-events-none">
                    <span>117.000</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px] shadow-sm">
                      116.480
                    </span>
                    <span>116.000</span>
                    <span>115.500</span>
                    <span>115.000</span>
                  </div>

                  {/* Volume Label & Time Axis */}
                  <div className="absolute bottom-1 left-3 text-[10px] font-bold text-slate-400 font-mono-numbers">
                    Vol <span className="text-emerald-400">18.7K</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-16 h-6 border-t border-slate-800/80 flex items-center justify-between px-6 text-[10px] font-mono-numbers text-slate-500 select-none">
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                    <span>13:00</span>
                    <span>14:00</span>
                    <span>15:00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other functional views if selected */}
            {activeCenterTab === 'tape' && (
              <div className="w-full h-full flex flex-col rounded-lg border border-slate-800 bg-[#070e1b] p-2.5 overflow-hidden">
                <span className="font-bold text-white text-xs mb-1.5">Fita de Negócios Contínua (Times & Trades)</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 font-mono-numbers text-[10px]">
                  {timesAndTrades.map((t) => (
                    <div key={t.id} className="grid grid-cols-5 py-0.5 px-2 rounded hover:bg-slate-800/40">
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
              <div className="w-full h-full flex flex-col rounded-lg border border-slate-800 bg-[#070e1b] p-2.5 overflow-hidden">
                <span className="font-bold text-white text-xs mb-1.5">Livro de Ofertas Vertical (DOM Ladder)</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 font-mono-numbers text-[10px]">
                  {bookOffers.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-3 py-0.5 px-3 rounded hover:bg-slate-800/40">
                      <span className="text-sky-400 font-bold">{b.bidQty > 0 ? b.bidQty : ''}</span>
                      <span className="text-center font-bold text-white">{b.price}</span>
                      <span className="text-right text-rose-400 font-bold">{b.askQty > 0 ? b.askQty : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeCenterTab === 'indicators' && (
              <div className="w-full h-full flex flex-col rounded-lg border border-slate-800 bg-[#070e1b] p-3 overflow-y-auto no-scrollbar space-y-2">
                <h4 className="font-bold text-white text-xs">Diagnóstico Técnico Automatizado</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">IFR / RSI (14)</span>
                    <strong className="text-emerald-400 font-bold font-mono-numbers">56.4 (Neutro-Alta)</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MACD (12, 26, 9)</span>
                    <strong className="text-emerald-400 font-bold font-mono-numbers">+142.0 (Compra)</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Estocástico Lento</span>
                    <strong className="text-amber-400 font-bold font-mono-numbers">68.2 (Sobrecompra)</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Bandas de Bollinger</span>
                    <strong className="text-sky-400 font-bold font-mono-numbers">Dentro da Banda</strong>
                  </div>
                </div>
              </div>
            )}

            {activeCenterTab === 'strategies' && (
              <div className="w-full h-full flex flex-col rounded-lg border border-slate-800 bg-[#070e1b] p-3 overflow-y-auto no-scrollbar space-y-2 text-xs">
                <h4 className="font-bold text-white">Estratégias de Scalping e Rompimento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400 block">1. Pullback na VWAP</span>
                    <p className="text-[11px] text-slate-400 mt-1">Entrada na retração após toque e rejeição da média ponderada com fluxo comprador.</p>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-sky-400 block">2. Cruzamento 9 x 21</span>
                    <p className="text-[11px] text-slate-400 mt-1">Gatilho de compra quando a MA 9 cruza para cima da MA 21 com candle fechado acima.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            3C. RIGHT COLUMN: "MERCADO EM TEMPO REAL" + BOLETA DE NEGOCIAÇÃO
           ======================================================================= */}
        <div className="w-64 sm:w-72 bg-[#050a14] border-l border-slate-800/90 flex flex-col justify-between p-2 shrink-0 select-none overflow-hidden">
          {/* Upper Right: Mercado em Tempo Real */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden pb-1">
            <h3 className="font-bold text-white text-xs mb-1">Mercado em Tempo Real</h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px] font-bold mb-1.5">
              {(['Ações', 'Futuros', 'Forex', 'Cripto', 'BDRs'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarketWatchCategory(cat)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer shrink-0 ${
                    marketWatchCategory === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left text-[10px] font-mono-numbers">
                <thead className="text-slate-400 border-b border-slate-800 sticky top-0 bg-[#050a14]">
                  <tr>
                    <th className="py-0.5">Ativo</th>
                    <th className="py-0.5 text-right">Preço</th>
                    <th className="py-0.5 text-right">Var %</th>
                    <th className="py-0.5 text-right">Vol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {marketWatchItems.map((row) => (
                    <tr
                      key={row.symbol}
                      onClick={() => setSelectedSymbol(row.symbol)}
                      className="hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="py-1 font-bold text-white">{row.symbol}</td>
                      <td className="py-1 text-right text-slate-200">{row.price}</td>
                      <td className={`py-1 text-right font-bold ${row.isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.change}
                      </td>
                      <td className="py-1 text-right text-slate-400">{row.vol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lower Right: Boleta de Negociação Imediata */}
          <div className="bg-[#09111e] border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2 shrink-0">
            {/* Compra / Venda Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-[#060c18] p-0.5 rounded-lg border border-slate-800 text-xs font-black">
              <button
                type="button"
                onClick={() => setOrderTicketTab('BUY')}
                className={`py-1 rounded-md transition cursor-pointer text-center ${
                  orderTicketTab === 'BUY'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => setOrderTicketTab('SELL')}
                className={`py-1 rounded-md transition cursor-pointer text-center ${
                  orderTicketTab === 'SELL'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Venda
              </button>
            </div>

            {/* Inputs: Ativo, Qtd, Tipo */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Ativo:</label>
                <input
                  type="text"
                  readOnly
                  value={selectedSymbol}
                  className="w-full bg-[#060c18] border border-slate-700 rounded px-1.5 py-1 text-white font-mono-numbers font-bold text-center"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Qtd (Lotes):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={contracts}
                  onChange={(e) => setContracts(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#060c18] border border-slate-700 rounded px-1.5 py-1 text-white font-mono-numbers font-bold text-center"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Tipo:</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-[#060c18] border border-slate-700 rounded px-1 py-1 text-white font-bold outline-none text-[9px]"
                >
                  <option value="MARKET">Mercado</option>
                  <option value="LIMIT">Limitada</option>
                </select>
              </div>
            </div>

            {/* Big Action Buttons (Comprar Green & Zerar Purple) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleExecuteOrder('BUY')}
                className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-950 active:scale-98"
              >
                COMPRAR
              </button>

              <button
                type="button"
                onClick={() => handleCloseAllPositions()}
                className="py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-indigo-950 active:scale-98"
              >
                ZERAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. LOWER THIRD (EXACT 4 HORIZONTAL CARDS AS IN THE REFERENCE SCREENSHOT)
         ========================================================================= */}
      <div className="h-44 sm:h-48 bg-[#050a14] border-t border-slate-800/90 p-2 grid grid-cols-12 gap-2 shrink-0 overflow-hidden">
        {/* Card 1: Minhas Posições (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 bg-[#09111e] border border-slate-800 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1">
            <span className="font-bold text-white text-xs">Minhas Posições</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <table className="w-full text-left text-[10px] font-mono-numbers">
              <thead className="text-slate-400 border-b border-slate-800 sticky top-0 bg-[#09111e]">
                <tr>
                  <th className="py-0.5">Ativo</th>
                  <th className="py-0.5 text-center">Qtd</th>
                  <th className="py-0.5 text-right">Preço Médio</th>
                  <th className="py-0.5 text-right">Preço Atual</th>
                  <th className="py-0.5 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {positions.map((pos) => {
                  const isWin = pos.symbol === 'WINFUT';
                  const isWdo = pos.symbol === 'WDOFUT';
                  const diff = pos.side === 'BUY' ? currentMarketPrice - pos.entryPrice : pos.entryPrice - currentMarketPrice;
                  const pnl = isWin ? diff * 0.2 * pos.contracts : isWdo ? diff * 10 * pos.contracts : diff * pos.contracts;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-800/40">
                      <td className="py-1 font-bold text-white">{pos.symbol}</td>
                      <td className="py-1 text-center text-slate-300">{pos.contracts}</td>
                      <td className="py-1 text-right text-slate-400">{pos.entryPrice.toLocaleString('pt-BR')}</td>
                      <td className="py-1 text-right text-white">{pos.currentPrice.toLocaleString('pt-BR')}</td>
                      <td className="py-1 text-right font-bold text-emerald-400">
                        +{formatCurrencyValue(pnl > 0 ? pnl : 72, 'BRL')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between font-mono-numbers">
            <span className="text-[10px] text-slate-400 font-bold">Total do Dia:</span>
            <span className="text-xs font-black text-emerald-400">+R$ 865,00</span>
          </div>
        </div>

        {/* Card 2: Performance do Dia (3 Cols) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#09111e] border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1">
            <span className="font-bold text-white text-xs">Performance do Dia</span>
          </div>

          <div className="flex items-center justify-between gap-2 py-1">
            {/* SVG Circular Assertiveness Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="87, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-black font-mono-numbers text-white">87%</span>
                <span className="text-[7px] text-slate-400 uppercase font-bold">Assertividade</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-0.5 text-[10px] font-mono-numbers flex-1">
              <div>
                <span className="text-slate-400 block text-[9px]">Lucro Líquido</span>
                <strong className="text-emerald-400 font-bold text-xs">+R$ 865,00</strong>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400">Rentabilidade:</span>
                <span className="text-emerald-400 font-bold">+1,87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tempo Operação:</span>
                <span className="text-white font-bold">{sessionTimer}</span>
              </div>
            </div>
          </div>

          {/* Mini Trades Bar Histogram */}
          <div className="flex items-end gap-1 h-3 pt-0.5">
            {[8, 12, 10, 16, 14, 18, 15, 20, 17, 22].map((val, idx) => (
              <div key={idx} className="flex-1 bg-emerald-500/30 rounded-xs" style={{ height: `${val}px` }} />
            ))}
          </div>
        </div>

        {/* Card 3: Notícias do Mercado (2.5 Cols) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-2.5 bg-[#09111e] border border-slate-800 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 mb-1">
            <span className="font-bold text-white text-xs">Notícias do Mercado</span>
            <button
              onClick={() => setActiveTab('noticias')}
              className="text-[9px] text-blue-400 hover:text-white font-bold"
            >
              Ver Todas &gt;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 text-[10px]">
            <div className="flex items-start gap-1.5">
              <span className="text-slate-500 font-mono-numbers shrink-0 text-[9px] mt-0.5">15:32</span>
              <p className="text-slate-300 line-clamp-2 leading-tight">
                Ibovespa acelera alta impulsionado por commodities e exterior positivo.
              </p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-slate-500 font-mono-numbers shrink-0 text-[9px] mt-0.5">15:10</span>
              <p className="text-slate-300 line-clamp-2 leading-tight">
                Dólar renova mínima com entrada de fluxo estrangeiro no país.
              </p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-slate-500 font-mono-numbers shrink-0 text-[9px] mt-0.5">14:45</span>
              <p className="text-slate-300 line-clamp-2 leading-tight">
                Petrobras avança com petróleo e projeta novos investimentos.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Promotional Blue Card "DinhEuro Day Trade Pro" (2.5 Cols) */}
        <div className="col-span-12 lg:col-span-2.5 rounded-xl bg-gradient-to-br from-blue-900/90 via-blue-950 to-indigo-950 border border-blue-500/40 p-2.5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-500/30 flex items-center justify-center text-amber-300">
              <Trophy className="w-3.5 h-3.5 fill-current" />
            </div>
            <strong className="text-white text-xs font-black">DinhEuro Day Trade Pro</strong>
          </div>

          <p className="text-[10px] text-slate-200 leading-tight py-1">
            Tecnologia, dados e estratégias para você operar no mais alto nível.
          </p>

          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className="w-full py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition cursor-pointer shadow flex items-center justify-center gap-1"
          >
            <span>Conheça Mais</span>
            <span>-&gt;</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. FIXED BOTTOM FOOTER (Connection: Estável & Partner Banks)
         ========================================================================= */}
      <footer className="bg-[#050a14] border-t border-slate-800/90 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-mono-numbers select-none">
        {/* Left: Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-emerald-400 font-sans font-bold">Conexão: Estável</strong>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">B3 Direct Feed • Liquidez Ativa</span>
        </div>

        {/* Center: Bank Partners */}
        <div className="hidden md:flex items-center gap-2 text-[9px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Banco do Brasil</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Caixa</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Itaú</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Bradesco</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Santander</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Inter</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">BTG Pactual</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Safra</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Nubank</span>
        </div>

        {/* Right: Institutional Terminal Tag */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">DinhEuro Terminal Pro</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">Licença Trader Institucional</span>
        </div>
      </footer>

      {/* =========================================================================
          6. AUTHENTICATION & REGISTRATION MODAL (REQUIREMENT 3)
         ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-cyan-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Controle de Acesso DinhEuro
                  </h3>
                  <span className="text-[10px] text-slate-400">Ambiente de Operações Profissionais</span>
                </div>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#060c18] p-0.5 rounded-lg border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthModalTab('profile')}
                className={`py-1 rounded-md transition cursor-pointer text-center ${
                  authModalTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Perfil
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className={`py-1 rounded-md transition cursor-pointer text-center ${
                  authModalTab === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className={`py-1 rounded-md transition cursor-pointer text-center ${
                  authModalTab === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* TAB: PROFILE */}
            {authModalTab === 'profile' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#070e1b] border border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                      <span className="text-base font-black text-amber-300">TS</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{authUser.name}</h4>
                    <span className="text-xs text-emerald-400 font-semibold block">{authUser.role}</span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">Conta: {authUser.accountNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Saldo Simulado:</span>
                    <strong className="text-white text-sm">R$ {accountBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">P&L Acumulado Hoje:</span>
                    <strong className="text-emerald-400 text-sm">+R$ {totalDayPnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveAuthUser({
                        ...DEFAULT_AUTH_USER,
                        name: 'Convidado (Simulador)',
                        role: 'Modo Anônimo',
                        isGuest: true,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold"
                  >
                    Trocar para Convidado
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    Continuar Operando
                  </button>
                </div>
              </div>
            )}

            {/* TAB: LOGIN */}
            {authModalTab === 'login' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAuthUser({
                    name: loginEmail.includes('tarciano') ? 'Tarciano Sousa' : loginEmail.split('@')[0],
                    role: 'Trader Profissional',
                    accountNumber: '49281-B3',
                    accountType: 'Simulação Pro Institucional',
                    email: loginEmail,
                    isGuest: false,
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="text-slate-400 block mb-1">E-mail Cadastrado:</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Senha de Acesso:</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono-numbers"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveAuthUser({
                        ...DEFAULT_AUTH_USER,
                        name: 'Visitante Simulado',
                        role: 'Paper Trader',
                        isGuest: true,
                      });
                    }}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 underline"
                  >
                    Continuar sem cadastro (Modo Simulado)
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    Acessar Terminal
                  </button>
                </div>
              </form>
            )}

            {/* TAB: REGISTER */}
            {authModalTab === 'register' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAuthUser({
                    name: registerName || 'Tarciano Sousa',
                    role: 'Trader Profissional',
                    accountNumber: `${Math.floor(Math.random() * 89999 + 10000)}-B3`,
                    accountType: 'Conta Pro Ativa',
                    email: registerEmail,
                    phone: registerPhone,
                    isGuest: false,
                  });
                }}
                className="space-y-2.5 text-xs"
              >
                <div>
                  <label className="text-slate-400 block mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">E-mail Profissional:</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">WhatsApp / Telefone:</label>
                  <input
                    type="text"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Senha Segura:</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 dígitos"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono-numbers"
                  />
                </div>

                <p className="text-[10px] text-slate-500 leading-tight pt-1">
                  Ao criar a conta, você tem acesso imediato à simulação de Day Trade e dados institucionais sob as políticas do DinhEuro.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                  >
                    Criar Conta & Liberar Acesso
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          7. RISK SETTINGS MODAL
         ========================================================================= */}
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
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Limite Máximo de Perda (Loss Limit R$):</label>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-mono-numbers font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Status da Trava de Risco:</span>
                  <span className={`font-bold ${isRiskLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isRiskLocked ? 'BLOQUEADO' : 'LIBERADO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resultado Consolidado:</span>
                  <span className={`font-bold font-mono-numbers ${totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalDayPnl >= 0 ? '+' : ''}{formatCurrencyValue(totalDayPnl, 'BRL')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsRiskLocked(false);
                  setShowRiskModal(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Resetar Trava
              </button>
              <button
                onClick={() => setShowRiskModal(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Salvar Regras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. PROMOTIONAL MODAL ("DinhEuro Day Trade Pro")
         ========================================================================= */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-blue-500/40 rounded-2xl max-w-lg w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  DinhEuro Day Trade Pro
                </h3>
              </div>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                O <strong className="text-white">DinhEuro Day Trade Pro</strong> é o ambiente de alta performance projetado para traders que exigem dados em tempo real, visualização de fluxo de ordens (Tape Reading), profundidade de mercado (DOM) e gráficos técnicos com cálculos dinâmicos de médias móveis.
              </p>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                <li>Execução simulada sem delay com motor financeiro nativo.</li>
                <li>Travas automáticas de risco e proteção patrimonial intraday.</li>
                <li>Compatibilidade total com minicontratos B3, Ações, Forex e Criptoativos.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Entendi e Voltar ao Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. ALERTS MODAL
         ========================================================================= */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alertas de Preço & Notificações</h3>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-mono-numbers">WINFUT &gt;= 116.500</strong>
                  <span className="text-[10px] text-slate-400">Rompimento de máxima diária</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">Ativo</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-mono-numbers">WDOFUT &lt;= 5.050,0</strong>
                  <span className="text-[10px] text-slate-400">Teste de suporte intraday</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">Ativo</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. HELP MODAL
         ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Atalhos do Terminal Day Trade</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono-numbers">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Comprar a Mercado:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 font-bold text-emerald-400">Shift + C</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Vender a Mercado:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 font-bold text-rose-400">Shift + V</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Zerar Posição Aberta:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 font-bold text-amber-400">Espaço</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
