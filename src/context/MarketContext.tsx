import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MarketAsset,
  NewsItem,
  UniversalRates,
  INITIAL_ASSETS,
  INITIAL_NEWS,
  DEFAULT_UNIVERSAL_RATES,
  fetchLiveExchangeRates,
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
  | 'sobre';

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
  const [news] = useState<NewsItem[]>(INITIAL_NEWS);
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [finnhubKey, setFinnhubKey] = useState<string>(getStoredFinnhubKey());
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'EUR' | 'USD'>('BRL');

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

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
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

  // Fetch live exchange rates and sync all currency blocks
  const refreshData = useCallback(async () => {
    try {
      const liveRates = await fetchLiveExchangeRates(finnhubKey);
      setUniversalRates(liveRates);

      // Micro-fluctuations simulating active live quotes across assets
      setAssets((prev) =>
        prev.map((asset) => {
          // Sync forex pairs directly and synchronously from universal rates
          if (asset.id === 'usd_brl') {
            const newPrice = Number(liveRates.BRL.toFixed(4));
            const changeVal = Number((newPrice - 5.48).toFixed(4));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 5.48) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }
          if (asset.id === 'eur_brl') {
            const eurRate = liveRates.BRL / (liveRates.EUR || 0.922);
            const newPrice = Number(eurRate.toFixed(4));
            const changeVal = Number((newPrice - 5.92).toFixed(4));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 5.92) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }
          if (asset.id === 'eur_usd') {
            const eurUsdRate = 1.0 / (liveRates.EUR || 0.922);
            const newPrice = Number(eurUsdRate.toFixed(4));
            const changeVal = Number((newPrice - 1.082).toFixed(4));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 1.082) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }
          if (asset.id === 'gbp_brl') {
            const gbpRate = liveRates.BRL / (liveRates.GBP || 0.774);
            const newPrice = Number(gbpRate.toFixed(4));
            const changeVal = Number((newPrice - 7.08).toFixed(4));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 7.08) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }
          if (asset.id === 'usd_jpy') {
            const newPrice = Number(liveRates.JPY.toFixed(2));
            const changeVal = Number((newPrice - 152.0).toFixed(2));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 152.0) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }
          if (asset.id === 'chf_brl') {
            const chfRate = liveRates.BRL / (liveRates.CHF || 0.865);
            const newPrice = Number(chfRate.toFixed(4));
            const changeVal = Number((newPrice - 6.32).toFixed(4));
            return {
              ...asset,
              price: newPrice,
              changeValue: changeVal,
              change24h: Number(((changeVal / 6.32) * 100).toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              sparkline: [...asset.sparkline.slice(1), newPrice],
            };
          }

          // Small random realistic tick for stocks, crypto & commodities
          const tickPercent = (Math.random() - 0.49) * 0.003;
          const newPrice = Number((asset.price * (1 + tickPercent)).toFixed(2));
          const diff = Number((newPrice - asset.price).toFixed(2));

          return {
            ...asset,
            price: newPrice,
            changeValue: Number((asset.changeValue + diff).toFixed(2)),
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
            sparkline: [...asset.sparkline.slice(1), newPrice],
          };
        })
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.warn('[DinhEuro] Refresh data warning:', err);
    }
  }, [finnhubKey]);

  // Periodic heartbeat every 12 seconds
  useEffect(() => {
    refreshData();
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      refreshData();
    }, 12000);

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
