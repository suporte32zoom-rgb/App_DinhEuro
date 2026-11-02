/**
 * Real-time Market Proxy Service for DinhEuro
 * Aggregates & normalizes live data from:
 * - AwesomeAPI Economy (VITE_AWESOME_ECONOMY_URL)
 * - Finnhub API (FINNHUB_API_KEY)
 * - Financial Modeling Prep (FMP_API_KEY)
 * - Binance Public Real-Time Ticker
 * - Brapi B3 Equities
 */

export interface LiveRatePair {
  code: string;
  codein: string;
  name: string;
  high: number;
  low: number;
  bid: number;
  ask: number;
  varBid: number;
  pctChange: number;
  timestamp: string;
}

export interface LiveMarketDataResponse {
  rates: {
    USD: number;
    BRL: number;
    EUR: number;
    GBP: number;
    JPY: number;
    CHF: number;
    CAD: number;
    AUD: number;
    CNY: number;
    BTC: number;
    ETH: number;
  };
  pairs: Record<string, LiveRatePair>;
  quotes: Record<string, {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    source: string;
  }>;
  news: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    category: string;
    datetime: string;
    imageUrl?: string;
  }>;
  sourcesStatus: {
    awesomeApi: boolean;
    finnhub: boolean;
    fmp: boolean;
    binance: boolean;
    brapi: boolean;
  };
  updatedAt: string;
}

// In-memory cache to prevent excessive rate-limiting and ensure fast responses
let cachedData: LiveMarketDataResponse | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 6000; // 6 seconds

export async function getAggregatedMarketData(): Promise<LiveMarketDataResponse> {
  const now = Date.now();
  if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedData;
  }

  const finnhubKey = process.env.FINNHUB_API_KEY || '';
  const fmpKey = process.env.FMP_API_KEY || '';
  const awesomeUrl =
    process.env.VITE_AWESOME_ECONOMY_URL ||
    'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL,CAD-BRL,AUD-BRL,CHF-BRL,JPY-BRL,CNY-BRL';

  const sourcesStatus = {
    awesomeApi: false,
    finnhub: false,
    fmp: false,
    binance: false,
    brapi: false,
  };

  const rates = {
    USD: 1.0,
    BRL: 5.485,
    EUR: 0.922,
    GBP: 0.774,
    JPY: 152.35,
    CHF: 0.865,
    CAD: 1.385,
    AUD: 1.518,
    CNY: 7.125,
    BTC: 0.0000146,
    ETH: 0.000385,
  };

  const pairs: Record<string, LiveRatePair> = {};
  const quotes: Record<string, any> = {};

  // 1. Fetch AwesomeAPI Economy for accurate real-time BRL FX & crypto in BRL
  try {
    const res = await fetch(awesomeUrl, { headers: { 'User-Agent': 'DinhEuro/2.0' } });
    if (res.ok) {
      const data = await res.json();
      sourcesStatus.awesomeApi = true;

      // Extract pairs
      for (const [key, val] of Object.entries<any>(data)) {
        const cleanKey = key.replace('-', '');
        const bid = parseFloat(val.bid) || 0;
        const ask = parseFloat(val.ask) || 0;
        const high = parseFloat(val.high) || 0;
        const low = parseFloat(val.low) || 0;
        const varBid = parseFloat(val.varBid) || 0;
        const pctChange = parseFloat(val.pctChange) || 0;

        pairs[cleanKey] = {
          code: val.code,
          codein: val.codein,
          name: val.name,
          high,
          low,
          bid,
          ask,
          varBid,
          pctChange,
          timestamp: val.create_date || new Date().toISOString(),
        };
      }

      if (pairs.USDBRL) {
        rates.BRL = pairs.USDBRL.bid;
        if (pairs.EURBRL) {
          rates.EUR = Number((pairs.USDBRL.bid / pairs.EURBRL.bid).toFixed(4));
        }
        if (pairs.GBPBRL) {
          rates.GBP = Number((pairs.USDBRL.bid / pairs.GBPBRL.bid).toFixed(4));
        }
        if (pairs.CADBRL) {
          rates.CAD = Number((pairs.USDBRL.bid / pairs.CADBRL.bid).toFixed(4));
        }
        if (pairs.AUDBRL) {
          rates.AUD = Number((pairs.USDBRL.bid / pairs.AUDBRL.bid).toFixed(4));
        }
        if (pairs.CHFBRL) {
          rates.CHF = Number((pairs.USDBRL.bid / pairs.CHFBRL.bid).toFixed(4));
        }
        if (pairs.JPYBRL) {
          rates.JPY = Number((pairs.USDBRL.bid / (pairs.JPYBRL.bid || 0.036)).toFixed(2));
        }
        if (pairs.CNYBRL) {
          rates.CNY = Number((pairs.USDBRL.bid / (pairs.CNYBRL.bid || 0.77)).toFixed(4));
        }
        if (pairs.BTCBRL) {
          const btcUsd = pairs.BTCBRL.bid / pairs.USDBRL.bid;
          rates.BTC = btcUsd > 0 ? Number((1 / btcUsd).toFixed(8)) : rates.BTC;
        }
      }
    }
  } catch (err) {
    console.warn('[MarketProxy] AwesomeAPI fetch error:', err);
  }

  // 2. Fetch Binance 24hr Ticker for real-time live crypto prices (BTC, ETH, SOL, BNB)
  try {
    const cryptoSymbols = encodeURIComponent(JSON.stringify(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']));
    const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${cryptoSymbols}`);
    if (binanceRes.ok) {
      const cryptoData = await binanceRes.json();
      sourcesStatus.binance = true;

      for (const item of cryptoData) {
        const lastPrice = parseFloat(item.lastPrice);
        const priceChange = parseFloat(item.priceChange);
        const priceChangePercent = parseFloat(item.priceChangePercent);
        const highPrice = parseFloat(item.highPrice);
        const lowPrice = parseFloat(item.lowPrice);
        const openPrice = parseFloat(item.openPrice);
        const prevClose = parseFloat(item.prevClosePrice);

        const symMap: Record<string, string> = {
          BTCUSDT: 'BTC/USD',
          ETHUSDT: 'ETH/USD',
          SOLUSDT: 'SOL/USD',
          BNBUSDT: 'BNB/USD',
        };

        const targetSym = symMap[item.symbol] || item.symbol;
        quotes[targetSym] = {
          symbol: targetSym,
          price: lastPrice,
          change: priceChange,
          changePercent: priceChangePercent,
          high: highPrice,
          low: lowPrice,
          open: openPrice,
          previousClose: prevClose,
          source: 'binance',
        };

        if (item.symbol === 'BTCUSDT' && lastPrice > 0) {
          rates.BTC = Number((1 / lastPrice).toFixed(8));
        }
        if (item.symbol === 'ETHUSDT' && lastPrice > 0) {
          rates.ETH = Number((1 / lastPrice).toFixed(8));
        }
      }
    }
  } catch (err) {
    console.warn('[MarketProxy] Binance crypto fetch error:', err);
  }

  // 3. Fetch Brapi for Brazilian B3 Equities (PETR4, VALE3, ITUB4, BBDC4, BBAS3, WEGE3)
  try {
    const brapiRes = await fetch('https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4,BBAS3,WEGE3,MGLU3,ABEV3');
    if (brapiRes.ok) {
      const brapiData = await brapiRes.json();
      if (brapiData && Array.isArray(brapiData.results)) {
        sourcesStatus.brapi = true;
        for (const stock of brapiData.results) {
          quotes[stock.symbol] = {
            symbol: stock.symbol,
            price: stock.regularMarketPrice,
            change: stock.regularMarketChange,
            changePercent: stock.regularMarketChangePercent,
            high: stock.regularMarketDayHigh,
            low: stock.regularMarketDayLow,
            open: stock.regularMarketOpen,
            previousClose: stock.regularMarketPreviousClose,
            source: 'brapi_b3',
          };
        }
      }
    }
  } catch (err) {
    console.warn('[MarketProxy] Brapi B3 fetch error:', err);
  }

  // 4. Fetch Finnhub Quotes for US Equities if API key is provided
  if (finnhubKey && finnhubKey !== 'MY_FINNHUB_API_KEY') {
    const finnhubSymbols = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA'];
    for (const sym of finnhubSymbols) {
      try {
        const fhRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`);
        if (fhRes.ok) {
          const data = await fhRes.json();
          if (data && data.c && data.c > 0) {
            sourcesStatus.finnhub = true;
            quotes[sym] = {
              symbol: sym,
              price: data.c,
              change: data.d,
              changePercent: data.dp,
              high: data.h,
              low: data.l,
              open: data.o,
              previousClose: data.pc,
              source: 'finnhub',
            };
          }
        }
      } catch (err) {
        console.warn(`[MarketProxy] Finnhub error for ${sym}:`, err);
      }
    }
  }

  // 5. Fetch FMP Quotes for US Equities or Global Indices if API key is provided
  if (fmpKey && fmpKey !== 'MY_FMP_API_KEY') {
    try {
      const fmpRes = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/AAPL,MSFT,NVDA,AMZN,GOOGL,META,TSLA,^GSPC,^IXIC,^DJI?apikey=${fmpKey}`
      );
      if (fmpRes.ok) {
        const fmpData = await fmpRes.json();
        if (Array.isArray(fmpData) && fmpData.length > 0) {
          sourcesStatus.fmp = true;
          for (const item of fmpData) {
            const sym = item.symbol === '^GSPC' ? 'S&P 500' : item.symbol === '^IXIC' ? 'NASDAQ' : item.symbol === '^DJI' ? 'DOW JONES' : item.symbol;
            quotes[sym] = {
              symbol: sym,
              price: item.price,
              change: item.change,
              changePercent: item.changesPercentage,
              high: item.dayHigh,
              low: item.dayLow,
              open: item.open,
              previousClose: item.previousClose,
              source: 'fmp',
            };
          }
        }
      }
    } catch (err) {
      console.warn('[MarketProxy] FMP fetch error:', err);
    }
  }

  // 6. News items (from Finnhub if key present, else authoritative finance news feed)
  let newsList: LiveMarketDataResponse['news'] = [];
  if (finnhubKey && finnhubKey !== 'MY_FINNHUB_API_KEY') {
    try {
      const newsRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        if (Array.isArray(newsData) && newsData.length > 0) {
          newsList = newsData.slice(0, 8).map((n: any, idx: number) => ({
            id: `fh_news_${idx}`,
            title: n.headline,
            summary: n.summary,
            source: n.source || 'Finnhub Market Wire',
            url: n.url,
            category: n.category || 'Geral',
            datetime: n.datetime ? new Date(n.datetime * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora',
            imageUrl: n.image,
          }));
        }
      }
    } catch (err) {
      console.warn('[MarketProxy] Finnhub news fetch error:', err);
    }
  }

  cachedData = {
    rates,
    pairs,
    quotes,
    news: newsList,
    sourcesStatus,
    updatedAt: new Date().toISOString(),
  };
  lastCacheTime = now;

  return cachedData;
}
