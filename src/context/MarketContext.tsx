import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  MarketAsset,
  NewsItem,
  UniversalRates,
  INITIAL_ASSETS,
  INITIAL_NEWS,
  DEFAULT_UNIVERSAL_RATES,
  fetchLiveExchangeRates,
  fetchCompleteLiveMarketData,
  getStoredFinnhubKey,
  setStoredFinnhubKey,
  obterCotacaoFinnhub,
} from '../services/marketData';

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  assetType: 'stock_br' | 'stock_us' | 'crypto' | 'forex';
  quantity: number;
  averageBuyPrice: number;
  currency: string;
  purchaseDate: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'mercados'
  | 'carteiras'
  | 'noticias'
  | 'corretoras'
  | 'graficos'
  | 'ferramentas'
  | 'academy'
  | 'sobre'
  | 'termos'
  | 'privacidade'
  | 'cookies'
  | 'disclaimer';

export const TAB_ROUTE_MAP: Record<NavigationTab, string> = {
  dashboard: '/',
  mercados: '/mercados',
  carteiras: '/carteiras',
  noticias: '/noticias',
  corretoras: '/corretoras',
  graficos: '/graficos',
  ferramentas: '/ferramentas',
  academy: '/academy',
  sobre: '/sobre',
  termos: '/termos-de-uso',
  privacidade: '/politica-de-privacidade',
  cookies: '/politica-de-cookies',
  disclaimer: '/disclaimer',
};

export const ROUTE_TAB_MAP: Record<string, NavigationTab> = {
  '/': 'dashboard',
  '/mercados': 'mercados',
  '/carteiras': 'carteiras',
  '/noticias': 'noticias',
  '/corretoras': 'corretoras',
  '/graficos': 'graficos',
  '/ferramentas': 'ferramentas',
  '/academy': 'academy',
  '/sobre': 'sobre',
  '/termos-de-uso': 'termos',
  '/termos': 'termos',
  '/politica-de-privacidade': 'privacidade',
  '/privacidade': 'privacidade',
  '/politica-de-cookies': 'cookies',
  '/cookies': 'cookies',
  '/disclaimer': 'disclaimer',
  '/aviso-legal': 'disclaimer',
};

export type ThemeMode = 'dark' | 'light';

interface MarketContextType {
  assets: MarketAsset[];
  universalRates: UniversalRates;
  news: NewsItem[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedAsset: MarketAsset | null;
  setSelectedAsset: (asset: MarketAsset | null) => void;
  openAssetDetail: (symbolOrId: string) => void;
  portfolio: PortfolioPosition[];
  addPortfolioPosition: (position: Omit<PortfolioPosition, 'id'>) => void;
  removePortfolioPosition: (id: string) => void;
  finnhubKey: string;
  updateFinnhubKey: (key: string) => void;
  isLiveUpdating: boolean;
  lastUpdated: Date;
  refreshData: () => Promise<void>;
  displayCurrency: 'BRL' | 'EUR' | 'USD';
  setDisplayCurrency: (currency: 'BRL' | 'EUR' | 'USD') => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  apiSourceSummary: string;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const PORTFOLIO_STORAGE_KEY = 'dinheuro_user_portfolio_v1';
const THEME_STORAGE_KEY = 'dinheuro_theme';

const INITIAL_DEMO_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'p1',
    symbol: 'PETR4',
    name: 'Petrobras PN',
    assetType: 'stock_br',
    quantity: 300,
    averageBuyPrice: 32.50,
    currency: 'BRL',
    purchaseDate: '2024-03-15',
  },
  {
    id: 'p2',
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    assetType: 'stock_us',
    quantity: 25,
    averageBuyPrice: 115.00,
    currency: 'USD',
    purchaseDate: '2024-05-10',
  },
  {
    id: 'p3',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    assetType: 'crypto',
    quantity: 0.15,
    averageBuyPrice: 58200.00,
    currency: 'USD',
    purchaseDate: '2024-02-20',
  },
  {
    id: 'p4',
    symbol: 'EUR/BRL',
    name: 'Reserva em Euro',
    assetType: 'forex',
    quantity: 1500,
    averageBuyPrice: 5.45,
    currency: 'BRL',
    purchaseDate: '2024-01-10',
  },
];

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [universalRates, setUniversalRates] = useState<UniversalRates>(DEFAULT_UNIVERSAL_RATES);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  // Active Tab State with URL routing support
  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname.toLowerCase();
    if (ROUTE_TAB_MAP[path]) {
      return ROUTE_TAB_MAP[path];
    }
    // Also check hash
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && ROUTE_TAB_MAP['/' + hash]) {
      return ROUTE_TAB_MAP['/' + hash];
    }
    return 'dashboard';
  });

  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [finnhubKey, setFinnhubKey] = useState<string>(getStoredFinnhubKey());
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'EUR' | 'USD'>('BRL');
  const [apiSourceSummary, setApiSourceSummary] = useState<string>('Bolsas Mundiais • Câmbio Interbancário • Criptoativos Globais');

  const assetsRef = useRef<MarketAsset[]>(assets);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Theme State: persisted in localStorage ('dark' or 'light')
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'dark';
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // ignore
      }
      return nextTheme;
    });
  }, []);

  // Sync theme with HTML document element and meta theme-color
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile chrome / safari address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0B1320' : '#F8FAFC');
    }
  }, [theme]);

  // Load portfolio from localStorage
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DEMO_PORTFOLIO;
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DEMO_PORTFOLIO;
  });

  // Save portfolio
  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // ignore
    }
  }, [portfolio]);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (ROUTE_TAB_MAP[path]) {
        setActiveTabState(ROUTE_TAB_MAP[path]);
      } else {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash && ROUTE_TAB_MAP['/' + hash]) {
          setActiveTabState(ROUTE_TAB_MAP['/' + hash]);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetRoute = TAB_ROUTE_MAP[tab] || '/';
      if (window.location.pathname !== targetRoute) {
        try {
          window.history.pushState(null, '', targetRoute);
        } catch {
          // ignore in environments with restricted history
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openAssetDetail = useCallback((symbolOrId: string) => {
    const match = assets.find(
      (a) => a.id.toLowerCase() === symbolOrId.toLowerCase() || a.symbol.toLowerCase() === symbolOrId.toLowerCase()
    );
    if (match) {
      setSelectedAsset(match);
    }
  }, [assets]);

  const addPortfolioPosition = useCallback((position: Omit<PortfolioPosition, 'id'>) => {
    const newPos: PortfolioPosition = {
      ...position,
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setPortfolio((prev) => [newPos, ...prev]);
  }, []);

  const removePortfolioPosition = useCallback((id: string) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateFinnhubKey = useCallback((key: string) => {
    setFinnhubKey(key);
    setStoredFinnhubKey(key);
  }, []);

  // Fetch live market data across all integrated APIs (Yahoo Finance, Coinbase, CoinGecko, BCE, Finnhub)
  const refreshData = useCallback(async () => {
    try {
      const snapshot = await fetchCompleteLiveMarketData(assetsRef.current);
      if (snapshot.rates) {
        setUniversalRates(snapshot.rates);
      }
      if (snapshot.updatedAssets && snapshot.updatedAssets.length > 0) {
        setAssets(snapshot.updatedAssets);
      }
      if (snapshot.news && snapshot.news.length > 0) {
        setNews(snapshot.news);
      }
      if (snapshot.sourceSummary) {
        setApiSourceSummary(snapshot.sourceSummary);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('[DinhEuro] Erro ao sincronizar mercado em tempo real:', err);
    }
  }, []);

  // Periodic heartbeat every 10 seconds for active real-time market updates
  useEffect(() => {
    refreshData();
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshData, isLiveUpdating]);

  return (
    <MarketContext.Provider
      value={{
        assets,
        universalRates,
        news,
        activeTab,
        setActiveTab,
        selectedAsset,
        setSelectedAsset,
        openAssetDetail,
        portfolio,
        addPortfolioPosition,
        removePortfolioPosition,
        finnhubKey,
        updateFinnhubKey,
        isLiveUpdating,
        lastUpdated,
        refreshData,
        displayCurrency,
        setDisplayCurrency,
        theme,
        toggleTheme,
        setTheme,
        apiSourceSummary,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
