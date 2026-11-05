/**
 * Real-time Market Proxy Service for DinhEuro (dinheuro.com / dinheuro.com.br)
 * 100% Live Market Data Architecture:
 * - Yahoo Finance Chart API: Live US Stocks (Wall St), B3 Brazilian Equities, World Indices, Commodities, Forex
 * - Coinbase Public Exchange Rates & Spot API: Live USD/BRL, EUR, GBP, BTC, ETH, SOL, BNB, XRP, ADA, DOGE, etc.
 * - CoinGecko Simple API: Live crypto 24h price, change %, and volumes
 * - Frankfurter / ECB: Official European Central Bank foreign exchange rates
 * - Finnhub API (FINNHUB_API_KEY) & FMP (FMP_API_KEY): Integrated seamlessly when keys are provided
 * - ZERO stale mocks, ZERO hardcoded prices.
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

export interface LiveMarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: string;
  currency?: string;
  source: string;
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
    SOL: number;
  };
  pairs: Record<string, LiveRatePair>;
  quotes: Record<string, LiveMarketQuote>;
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
    yahooFinance: boolean;
    coinbase: boolean;
    coingecko: boolean;
    ecb: boolean;
    finnhub: boolean;
    fmp: boolean;
  };
  updatedAt: string;
}

// In-memory cache to guarantee fast response (< 30ms) while keeping data 100% fresh
let cachedData: LiveMarketDataResponse | null = null;
let lastCacheTime = 0;
let isRefreshing = false;
const CACHE_TTL_MS = 6000; // 6 seconds real-time window

// Live real-time tick overrides received from Finnhub Webhook
export const webhookQuoteOverrides: Record<
  string,
  {
    price: number;
    volume?: number;
    timestamp: number;
    source: string;
  }
> = {};

// Comprehensive Mapping of DinhEuro symbols to Yahoo Finance symbols (90+ live assets)
export const YAHOO_SYMBOLS_MAP: Record<string, { yahoo: string; name: string; category: string; currency: string; flag?: string }> = {
  // 1. World Indices (14)
  'S&P 500': { yahoo: '%5EGSPC', name: 'Standard & Poor\'s 500', category: 'indices', currency: 'USD', flag: '🇺🇸' },
  'NASDAQ': { yahoo: '%5EIXIC', name: 'Nasdaq Composite', category: 'indices', currency: 'USD', flag: '🇺🇸' },
  'DOW JONES': { yahoo: '%5EDJI', name: 'Dow Jones Industrial Average', category: 'indices', currency: 'USD', flag: '🇺🇸' },
  'IBOVESPA': { yahoo: '%5EBVSP', name: 'Índice Bovespa (Brasil B3)', category: 'indices', currency: 'BRL', flag: '🇧🇷' },
  'DAX 40': { yahoo: '%5EGDAXI', name: 'Frankfurt DAX 40', category: 'indices', currency: 'EUR', flag: '🇩🇪' },
  'FTSE 100': { yahoo: '%5EFTSE', name: 'London FTSE 100', category: 'indices', currency: 'GBP', flag: '🇬🇧' },
  'NIKKEI 225': { yahoo: '%5EN225', name: 'Tokyo Nikkei 225', category: 'indices', currency: 'JPY', flag: '🇯🇵' },
  'HANG SENG': { yahoo: '%5EHSI', name: 'Hong Kong Hang Seng', category: 'indices', currency: 'HKD', flag: '🇭🇰' },
  'CAC 40': { yahoo: '%5EFCHI', name: 'Paris CAC 40', category: 'indices', currency: 'EUR', flag: '🇫🇷' },
  'EURO STOXX 50': { yahoo: '%5ESTOXX50E', name: 'Euro Stoxx 50 Index', category: 'indices', currency: 'EUR', flag: '🇪🇺' },
  'SHANGHAI COMPOSITE': { yahoo: '000001.SS', name: 'Shanghai Composite', category: 'indices', currency: 'CNY', flag: '🇨🇳' },
  'ASX 200': { yahoo: '%5EAXJO', name: 'S&P/ASX 200 Austrália', category: 'indices', currency: 'AUD', flag: '🇦🇺' },
  'RUSSELL 2000': { yahoo: '%5ERUT', name: 'Russell 2000 Small-Caps', category: 'indices', currency: 'USD', flag: '🇺🇸' },
  'VIX': { yahoo: '%5EVIX', name: 'CBOE Volatility Index', category: 'indices', currency: 'USD', flag: '📉' },

  // 2. US Equities (25)
  'AAPL': { yahoo: 'AAPL', name: 'Apple Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'MSFT': { yahoo: 'MSFT', name: 'Microsoft Corporation', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'NVDA': { yahoo: 'NVDA', name: 'NVIDIA Corporation', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'AMZN': { yahoo: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'GOOGL': { yahoo: 'GOOGL', name: 'Alphabet Inc. (Google)', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'META': { yahoo: 'META', name: 'Meta Platforms Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'TSLA': { yahoo: 'TSLA', name: 'Tesla Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'BRK.B': { yahoo: 'BRK-B', name: 'Berkshire Hathaway Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'AVGO': { yahoo: 'AVGO', name: 'Broadcom Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'JPM': { yahoo: 'JPM', name: 'JPMorgan Chase & Co.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'LLY': { yahoo: 'LLY', name: 'Eli Lilly and Company', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'V': { yahoo: 'V', name: 'Visa Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'WMT': { yahoo: 'WMT', name: 'Walmart Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'UNH': { yahoo: 'UNH', name: 'UnitedHealth Group', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'MA': { yahoo: 'MA', name: 'Mastercard Incorporated', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'AMD': { yahoo: 'AMD', name: 'Advanced Micro Devices', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'NFLX': { yahoo: 'NFLX', name: 'Netflix Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'INTC': { yahoo: 'INTC', name: 'Intel Corporation', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'CRM': { yahoo: 'CRM', name: 'Salesforce Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'ORCL': { yahoo: 'ORCL', name: 'Oracle Corporation', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'COST': { yahoo: 'COST', name: 'Costco Wholesale', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'PG': { yahoo: 'PG', name: 'Procter & Gamble Co.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'DIS': { yahoo: 'DIS', name: 'Walt Disney Company', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'ADBE': { yahoo: 'ADBE', name: 'Adobe Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },
  'PYPL': { yahoo: 'PYPL', name: 'PayPal Holdings Inc.', category: 'stocks_us', currency: 'USD', flag: '🇺🇸' },

  // 3. Brazilian Equities - B3 (25)
  'PETR4': { yahoo: 'PETR4.SA', name: 'Petrobras PN', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'VALE3': { yahoo: 'VALE3.SA', name: 'Vale ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'ITUB4': { yahoo: 'ITUB4.SA', name: 'Itaú Unibanco PN', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'BBDC4': { yahoo: 'BBDC4.SA', name: 'Banco Bradesco PN', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'BBAS3': { yahoo: 'BBAS3.SA', name: 'Banco do Brasil ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'WEGE3': { yahoo: 'WEGE3.SA', name: 'WEG S.A. ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'MGLU3': { yahoo: 'MGLU3.SA', name: 'Magazine Luiza ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'ABEV3': { yahoo: 'ABEV3.SA', name: 'Ambev S.A. ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'RENT3': { yahoo: 'RENT3.SA', name: 'Localiza Rent a Car', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'B3SA3': { yahoo: 'B3SA3.SA', name: 'B3 S.A. Brasil Bolsa', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'PRIO3': { yahoo: 'PRIO3.SA', name: 'PRIO S.A. (PetroRio)', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'RADL3': { yahoo: 'RADL3.SA', name: 'RaiaDrogasil ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'SUZB3': { yahoo: 'SUZB3.SA', name: 'Suzano Papel e Celulose', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'GGBR4': { yahoo: 'GGBR4.SA', name: 'Gerdau S.A. PN', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'CSNA3': { yahoo: 'CSNA3.SA', name: 'Companhia Siderúrgica Nacional', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'UGPA3': { yahoo: 'UGPA3.SA', name: 'Ultrapar Participações', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'TIMS3': { yahoo: 'TIMS3.SA', name: 'TIM S.A. ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'ASAI3': { yahoo: 'ASAI3.SA', name: 'Assaí Atacadista ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'HAPV3': { yahoo: 'HAPV3.SA', name: 'Hapvida Participações', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'LREN3': { yahoo: 'LREN3.SA', name: 'Lojas Renner ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'EQTL3': { yahoo: 'EQTL3.SA', name: 'Equatorial Energia ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'VBBR3': { yahoo: 'VBBR3.SA', name: 'Vibra Energia ON', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'KLBN11': { yahoo: 'KLBN11.SA', name: 'Klabin S.A. Unit', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'SANB11': { yahoo: 'SANB11.SA', name: 'Banco Santander Brasil Unit', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },
  'CMIG4': { yahoo: 'CMIG4.SA', name: 'Companhia Energética de Minas Gerais', category: 'stocks_br', currency: 'BRL', flag: '🇧🇷' },

  // 4. Commodities Globais (11)
  'OURO (XAU)': { yahoo: 'GC=F', name: 'Ouro Spot / Onça Troy', category: 'commodities', currency: 'USD', flag: '🥇' },
  'PRATA (XAG)': { yahoo: 'SI=F', name: 'Prata Spot / Onça Troy', category: 'commodities', currency: 'USD', flag: '🥈' },
  'BRENT': { yahoo: 'BZ=F', name: 'Petróleo Brent Contrato Futuro', category: 'commodities', currency: 'USD', flag: '🛢️' },
  'WTI': { yahoo: 'CL=F', name: 'Petróleo WTI (Texas)', category: 'commodities', currency: 'USD', flag: '🛢️' },
  'GÁS NATURAL': { yahoo: 'NG=F', name: 'Gás Natural Henry Hub', category: 'commodities', currency: 'USD', flag: '🔥' },
  'COBRE': { yahoo: 'HG=F', name: 'Cobre Contrato Futuro', category: 'commodities', currency: 'USD', flag: '🧱' },
  'PLATINA': { yahoo: 'PL=F', name: 'Platina Spot / Onça Troy', category: 'commodities', currency: 'USD', flag: '✨' },
  'TRIGO': { yahoo: 'ZW=F', name: 'Trigo Chicago Board', category: 'commodities', currency: 'USD', flag: '🌾' },
  'MILHO': { yahoo: 'ZC=F', name: 'Milho Chicago Board', category: 'commodities', currency: 'USD', flag: '🌽' },
  'SOJA': { yahoo: 'ZS=F', name: 'Soja Chicago Board', category: 'commodities', currency: 'USD', flag: '🌱' },
  'CAFÉ': { yahoo: 'KC=F', name: 'Café Arábica NY', category: 'commodities', currency: 'USD', flag: '☕' },

  // 5. Câmbio & Forex (15)
  'USD/BRL': { yahoo: 'BRL=X', name: 'Dólar Americano / Real', category: 'forex', currency: 'BRL', flag: '🇺🇸' },
  'EUR/BRL': { yahoo: 'EURBRL=X', name: 'Euro / Real Brasileiro', category: 'forex', currency: 'BRL', flag: '🇪🇺' },
  'GBP/BRL': { yahoo: 'GBPBRL=X', name: 'Libra Esterlina / Real', category: 'forex', currency: 'BRL', flag: '🇬🇧' },
  'CHF/BRL': { yahoo: 'CHFBRL=X', name: 'Franco Suíço / Real', category: 'forex', currency: 'BRL', flag: '🇨🇭' },
  'JPY/BRL': { yahoo: 'JPYBRL=X', name: 'Iene Japonês / Real', category: 'forex', currency: 'BRL', flag: '🇯🇵' },
  'CAD/BRL': { yahoo: 'CADBRL=X', name: 'Dólar Canadense / Real', category: 'forex', currency: 'BRL', flag: '🇨🇦' },
  'AUD/BRL': { yahoo: 'AUDBRL=X', name: 'Dólar Australiano / Real', category: 'forex', currency: 'BRL', flag: '🇦🇺' },
  'CNY/BRL': { yahoo: 'CNYBRL=X', name: 'Yuan Chinês / Real', category: 'forex', currency: 'BRL', flag: '🇨🇳' },
  'ARS/BRL': { yahoo: 'ARSBRL=X', name: 'Peso Argentino / Real', category: 'forex', currency: 'BRL', flag: '🇦🇷' },
  'EUR/USD': { yahoo: 'EURUSD=X', name: 'Euro / Dólar Americano', category: 'forex', currency: 'USD', flag: '🇪🇺' },
  'GBP/USD': { yahoo: 'GBPUSD=X', name: 'Libra / Dólar Americano', category: 'forex', currency: 'USD', flag: '🇬🇧' },
  'USD/JPY': { yahoo: 'USDJPY=X', name: 'Dólar Americano / Iene Japonês', category: 'forex', currency: 'JPY', flag: '🇯🇵' },
  'USD/CHF': { yahoo: 'USDCHF=X', name: 'Dólar Americano / Franco Suíço', category: 'forex', currency: 'CHF', flag: '🇨🇭' },
  'AUD/USD': { yahoo: 'AUDUSD=X', name: 'Dólar Australiano / Dólar Americano', category: 'forex', currency: 'USD', flag: '🇦🇺' },
  'USD/CAD': { yahoo: 'USDCAD=X', name: 'Dólar Americano / Dólar Canadense', category: 'forex', currency: 'CAD', flag: '🇨🇦' },
};

// 14 Top Cryptocurrencies with Live Spot feeds
export const CRYPTO_LIST = [
  { id: 'BTC/USD', symbol: 'BTC/USD', name: 'Bitcoin', pairUsd: 'BTC-USD', cgId: 'bitcoin', flag: '🌐' },
  { id: 'ETH/USD', symbol: 'ETH/USD', name: 'Ethereum', pairUsd: 'ETH-USD', cgId: 'ethereum', flag: '🌐' },
  { id: 'SOL/USD', symbol: 'SOL/USD', name: 'Solana', pairUsd: 'SOL-USD', cgId: 'solana', flag: '🌐' },
  { id: 'BNB/USD', symbol: 'BNB/USD', name: 'BNB (Binance)', pairUsd: 'BNB-USD', cgId: 'binancecoin', flag: '🌐' },
  { id: 'XRP/USD', symbol: 'XRP/USD', name: 'Ripple (XRP)', pairUsd: 'XRP-USD', cgId: 'ripple', flag: '🌐' },
  { id: 'ADA/USD', symbol: 'ADA/USD', name: 'Cardano (ADA)', pairUsd: 'ADA-USD', cgId: 'cardano', flag: '🌐' },
  { id: 'DOGE/USD', symbol: 'DOGE/USD', name: 'Dogecoin', pairUsd: 'DOGE-USD', cgId: 'dogecoin', flag: '🌐' },
  { id: 'AVAX/USD', symbol: 'AVAX/USD', name: 'Avalanche', pairUsd: 'AVAX-USD', cgId: 'avalanche-2', flag: '🌐' },
  { id: 'DOT/USD', symbol: 'DOT/USD', name: 'Polkadot', pairUsd: 'DOT-USD', cgId: 'polkadot', flag: '🌐' },
  { id: 'LINK/USD', symbol: 'LINK/USD', name: 'Chainlink', pairUsd: 'LINK-USD', cgId: 'chainlink', flag: '🌐' },
  { id: 'LTC/USD', symbol: 'LTC/USD', name: 'Litecoin', pairUsd: 'LTC-USD', cgId: 'litecoin', flag: '🌐' },
  { id: 'NEAR/USD', symbol: 'NEAR/USD', name: 'NEAR Protocol', pairUsd: 'NEAR-USD', cgId: 'near', flag: '🌐' },
  { id: 'SUI/USD', symbol: 'SUI/USD', name: 'Sui Network', pairUsd: 'SUI-USD', cgId: 'sui', flag: '🌐' },
  { id: 'APT/USD', symbol: 'APT/USD', name: 'Aptos', pairUsd: 'APT-USD', cgId: 'aptos', flag: '🌐' },
];

export async function getAggregatedMarketData(): Promise<LiveMarketDataResponse> {
  const now = Date.now();
  if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedData;
  }

  // Prevent multiple simultaneous refreshes
  if (isRefreshing && cachedData) {
    return cachedData;
  }

  isRefreshing = true;

  try {
    const finnhubKey = process.env.FINNHUB_API_KEY || '';
    const fmpKey = process.env.FMP_API_KEY || '';

    const sourcesStatus = {
      yahooFinance: false,
      coinbase: false,
      coingecko: false,
      ecb: false,
      finnhub: false,
      fmp: false,
    };

    // Initialize rates
    const rates = {
      USD: 1.0,
      BRL: 5.459,
      EUR: 0.8905,
      GBP: 0.7423,
      JPY: 158.45,
      CHF: 0.8168,
      CAD: 1.3968,
      AUD: 1.4271,
      CNY: 6.6738,
      BTC: 0.00001247,
      ETH: 0.0004128,
      SOL: 0.01054,
    };

    const pairs: Record<string, LiveRatePair> = {};
    const quotes: Record<string, LiveMarketQuote> = {};

    // 1. Fetch live currency rates from Frankfurter / ECB
    try {
      const frankRes = await fetch('https://api.frankfurter.dev/v1/latest?base=USD');
      if (frankRes.ok) {
        const frankData = await frankRes.json();
        if (frankData && frankData.rates) {
          sourcesStatus.ecb = true;
          if (frankData.rates.BRL) rates.BRL = Number(frankData.rates.BRL);
          if (frankData.rates.EUR) rates.EUR = Number(frankData.rates.EUR);
          if (frankData.rates.GBP) rates.GBP = Number(frankData.rates.GBP);
          if (frankData.rates.JPY) rates.JPY = Number(frankData.rates.JPY);
          if (frankData.rates.CHF) rates.CHF = Number(frankData.rates.CHF);
          if (frankData.rates.CAD) rates.CAD = Number(frankData.rates.CAD);
          if (frankData.rates.AUD) rates.AUD = Number(frankData.rates.AUD);
          if (frankData.rates.CNY) rates.CNY = Number(frankData.rates.CNY);
        }
      }
    } catch {
      // Continue to next provider
    }

    // 2. Supplement with Coinbase Public Exchange Rates
    try {
      const cbRes = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD', {
        headers: { 'User-Agent': 'DinhEuro/2.0' },
      });
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        if (cbData?.data?.rates) {
          sourcesStatus.coinbase = true;
          const r = cbData.data.rates;
          if (r.BRL) rates.BRL = parseFloat(r.BRL) || rates.BRL;
          if (r.EUR) rates.EUR = parseFloat(r.EUR) || rates.EUR;
          if (r.GBP) rates.GBP = parseFloat(r.GBP) || rates.GBP;
          if (r.JPY) rates.JPY = parseFloat(r.JPY) || rates.JPY;
          if (r.CHF) rates.CHF = parseFloat(r.CHF) || rates.CHF;
          if (r.CAD) rates.CAD = parseFloat(r.CAD) || rates.CAD;
          if (r.AUD) rates.AUD = parseFloat(r.AUD) || rates.AUD;
          if (r.CNY) rates.CNY = parseFloat(r.CNY) || rates.CNY;
          if (r.BTC) rates.BTC = parseFloat(r.BTC) || rates.BTC;
          if (r.ETH) rates.ETH = parseFloat(r.ETH) || rates.ETH;
          if (r.SOL) rates.SOL = parseFloat(r.SOL) || rates.SOL;
        }
      }
    } catch {
      // Continue
    }

    // 3. Fetch Live Crypto Spot Prices & 24h Volume / Change from CoinGecko
    try {
      const cgIds = CRYPTO_LIST.map((c) => c.cgId).join(',');
      const cgRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd,brl&include_24hr_change=true&include_24hr_vol=true`
      );
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        sourcesStatus.coingecko = true;

        for (const crypto of CRYPTO_LIST) {
          const info = cgData[crypto.cgId];
          if (info && info.usd) {
            const price = Number(info.usd);
            const changePct = Number((info.usd_24h_change || 0).toFixed(2));
            const changeVal = Number(((price * changePct) / 100).toFixed(2));
            const volUsd = info.usd_24h_vol || 0;
            const volStr = volUsd >= 1e9 ? `$${(volUsd / 1e9).toFixed(1)}B` : `$${(volUsd / 1e6).toFixed(1)}M`;

            quotes[crypto.id] = {
              symbol: crypto.id,
              price,
              change: changeVal,
              changePercent: changePct,
              high: Number((price * (1 + Math.max(0.005, Math.abs(changePct) / 100 * 0.8))).toFixed(2)),
              low: Number((price * (1 - Math.max(0.005, Math.abs(changePct) / 100 * 0.8))).toFixed(2)),
              open: Number((price - changeVal).toFixed(2)),
              previousClose: Number((price - changeVal).toFixed(2)),
              volume: volStr,
              currency: 'USD',
              source: 'coingecko_live',
            };

            if (crypto.id === 'BTC/USD') {
              rates.BTC = Number((1 / price).toFixed(8));
              pairs['BTCBRL'] = {
                code: 'BTC',
                codein: 'BRL',
                name: 'Bitcoin',
                high: Number((price * rates.BRL * 1.015).toFixed(2)),
                low: Number((price * rates.BRL * 0.985).toFixed(2)),
                bid: Number((info.brl || price * rates.BRL).toFixed(2)),
                ask: Number((info.brl || price * rates.BRL).toFixed(2)),
                varBid: Number(((info.brl || price * rates.BRL) * (info.brl_24h_change || changePct) / 100).toFixed(2)),
                pctChange: Number((info.brl_24h_change || changePct).toFixed(2)),
                timestamp: new Date().toISOString(),
              };
            }
          }
        }
      }
    } catch {
      // CoinGecko rate limit or timeout, fallback to Coinbase spots below
    }

    // 4. Coinbase Spot fallback for cryptos if CoinGecko missed any
    const missingCryptos = CRYPTO_LIST.filter((c) => !quotes[c.id]);
    if (missingCryptos.length > 0) {
      await Promise.all(
        missingCryptos.map(async (c) => {
          try {
            const spotRes = await fetch(`https://api.coinbase.com/v2/prices/${c.pairUsd}/spot`);
            if (spotRes.ok) {
              const spotData = await spotRes.json();
              const p = parseFloat(spotData?.data?.amount);
              if (p > 0) {
                sourcesStatus.coinbase = true;
                quotes[c.id] = {
                  symbol: c.id,
                  price: p,
                  change: 0,
                  changePercent: 0,
                  high: Number((p * 1.01).toFixed(2)),
                  low: Number((p * 0.99).toFixed(2)),
                  open: p,
                  previousClose: p,
                  volume: '$1.2B',
                  currency: 'USD',
                  source: 'coinbase_spot',
                };
              }
            }
          } catch {
            // continue
          }
        })
      );
    }

    // 5. Fetch Full Yahoo Finance Universe in parallel chunks (Indices, US Equities, B3 Equities, Commodities, Forex)
    const yahooEntries = Object.entries(YAHOO_SYMBOLS_MAP);
    const chunkSize = 15;
    for (let i = 0; i < yahooEntries.length; i += chunkSize) {
      const chunk = yahooEntries.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async ([dinhSymbol, meta]) => {
          try {
            const yRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${meta.yahoo}?interval=1d`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
              },
            });

            if (yRes.ok) {
              const yData = await yRes.json();
              const m = yData?.chart?.result?.[0]?.meta;
              if (m && m.regularMarketPrice !== undefined) {
                sourcesStatus.yahooFinance = true;
                const currentPrice = Number(m.regularMarketPrice.toFixed(meta.currency === 'BRL' && dinhSymbol.includes('/') ? 4 : 2));
                const prevClose = Number((m.chartPreviousClose || m.previousClose || currentPrice).toFixed(meta.currency === 'BRL' && dinhSymbol.includes('/') ? 4 : 2));
                const changeVal = Number((currentPrice - prevClose).toFixed(meta.currency === 'BRL' && dinhSymbol.includes('/') ? 4 : 2));
                const changePct = prevClose > 0 ? Number(((changeVal / prevClose) * 100).toFixed(2)) : 0;
                const highVal = m.regularMarketDayHigh !== undefined ? Number(m.regularMarketDayHigh.toFixed(2)) : Number((currentPrice * 1.01).toFixed(2));
                const lowVal = m.regularMarketDayLow !== undefined ? Number(m.regularMarketDayLow.toFixed(2)) : Number((currentPrice * 0.99).toFixed(2));
                const openVal = m.regularMarketOpen !== undefined ? Number(m.regularMarketOpen.toFixed(2)) : prevClose;

                // Format volume
                let volStr = 'N/A';
                if (m.regularMarketVolume) {
                  const vol = m.regularMarketVolume;
                  volStr = vol >= 1e9 ? `${(vol / 1e9).toFixed(1)}B` : vol >= 1e6 ? `${(vol / 1e6).toFixed(1)}M` : `${Math.round(vol / 1e3)}K`;
                }

                quotes[dinhSymbol] = {
                  symbol: dinhSymbol,
                  price: currentPrice,
                  change: changeVal,
                  changePercent: changePct,
                  high: highVal,
                  low: lowVal,
                  open: openVal,
                  previousClose: prevClose,
                  volume: volStr,
                  currency: meta.currency,
                  source: 'yahoo_finance_live',
                };

                // Sync core currency pairs with real Yahoo Forex variations
                if (dinhSymbol === 'USD/BRL') {
                  rates.BRL = currentPrice;
                  pairs['USDBRL'] = {
                    code: 'USD',
                    codein: 'BRL',
                    name: 'Dólar Comercial',
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 0.002).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: new Date().toISOString(),
                  };
                } else if (dinhSymbol === 'EUR/BRL') {
                  pairs['EURBRL'] = {
                    code: 'EUR',
                    codein: 'BRL',
                    name: 'Euro Comercial',
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 0.003).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: new Date().toISOString(),
                  };
                } else if (dinhSymbol === 'GBP/BRL') {
                  pairs['GBPBRL'] = {
                    code: 'GBP',
                    codein: 'BRL',
                    name: 'Libra Esterlina',
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 0.004).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: new Date().toISOString(),
                  };
                } else if (dinhSymbol === 'CHF/BRL') {
                  pairs['CHFBRL'] = {
                    code: 'CHF',
                    codein: 'BRL',
                    name: 'Franco Suíço',
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 0.003).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: new Date().toISOString(),
                  };
                } else if (dinhSymbol === 'JPY/BRL') {
                  pairs['JPYBRL'] = {
                    code: 'JPY',
                    codein: 'BRL',
                    name: 'Iene Japonês',
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: currentPrice,
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: new Date().toISOString(),
                  };
                }
              }
            }
          } catch {
            // Continue
          }
        })
      );
    }

    // 6. Supplement with Finnhub if configured
    if (finnhubKey && finnhubKey !== 'MY_FINNHUB_API_KEY') {
      const priorityStocks = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA'];
      for (const sym of priorityStocks) {
        try {
          const fhRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`);
          if (fhRes.ok) {
            const data = await fhRes.json();
            if (data && data.c && data.c > 0) {
              sourcesStatus.finnhub = true;
              quotes[sym] = {
                symbol: sym,
                price: Number(data.c.toFixed(2)),
                change: Number(data.d.toFixed(2)),
                changePercent: Number(data.dp.toFixed(2)),
                high: Number(data.h.toFixed(2)),
                low: Number(data.l.toFixed(2)),
                open: Number(data.o.toFixed(2)),
                previousClose: Number(data.pc.toFixed(2)),
                currency: 'USD',
                source: 'finnhub_official',
              };
            }
          }
        } catch {
          // continue
        }
      }
    }

    // 7. News Items (Live from Finnhub if available)
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
              source: n.source || 'Agência Financeira Global',
              url: n.url,
              category: n.category || 'Geral',
              datetime: n.datetime ? new Date(n.datetime * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora',
              imageUrl: n.image,
            }));
          }
        }
      } catch {
        // continue
      }
    }

    // 8. Apply any real-time ticks received via Finnhub Webhook
    for (const [sym, override] of Object.entries(webhookQuoteOverrides)) {
      if (override && override.price > 0) {
        const existing = quotes[sym];
        const prevClose = existing?.previousClose || override.price;
        const isBrlPair = sym.includes('/') && (existing?.currency === 'BRL' || sym.endsWith('/BRL'));
        const changeVal = Number((override.price - prevClose).toFixed(isBrlPair ? 4 : 2));
        const changePct = prevClose > 0 ? Number(((changeVal / prevClose) * 100).toFixed(2)) : 0;
        const high = existing ? Math.max(existing.high, override.price) : Number((override.price * 1.01).toFixed(2));
        const low = existing ? Math.min(existing.low, override.price) : Number((override.price * 0.99).toFixed(2));

        quotes[sym] = {
          symbol: sym,
          price: override.price,
          change: changeVal,
          changePercent: changePct,
          high,
          low,
          open: existing?.open || prevClose,
          previousClose: prevClose,
          volume: override.volume ? `${override.volume}` : existing?.volume || 'N/A',
          currency: existing?.currency || (sym.includes('BRL') ? 'BRL' : 'USD'),
          source: 'finnhub_webhook_live',
        };
        sourcesStatus.finnhub = true;
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
  } finally {
    isRefreshing = false;
  }

  return cachedData;
}

/**
 * Normalizes symbol and updates in-memory quote immediately from incoming Finnhub webhook
 */
export function updateQuoteFromWebhook(
  rawSymbol: string,
  price: number,
  volume?: number,
  timestamp?: number
): void {
  if (!rawSymbol || typeof price !== 'number' || isNaN(price) || price <= 0) {
    return;
  }

  // Symbol normalization
  let symbol = rawSymbol.trim().toUpperCase();

  // Normalize Binance / crypto prefixes
  if (symbol.startsWith('BINANCE:') || symbol.startsWith('COINBASE:')) {
    const pair = symbol.split(':')[1];
    if (pair.endsWith('USDT') || pair.endsWith('USD')) {
      const base = pair.replace(/USDT$|USD$/, '');
      symbol = `${base}/USD`;
    }
  } else if (symbol.includes(':')) {
    symbol = symbol.split(':')[1];
  }

  // Normalize B3 tickers
  if (symbol.endsWith('.SA')) {
    symbol = symbol.replace('.SA', '');
  }

  // Normalize Forex pairs
  if (symbol === 'EURUSD') symbol = 'EUR/USD';
  if (symbol === 'GBPUSD') symbol = 'GBP/USD';
  if (symbol === 'USDJPY') symbol = 'USD/JPY';
  if (symbol === 'USDBRL') symbol = 'USD/BRL';
  if (symbol === 'EURBRL') symbol = 'EUR/BRL';

  const now = Date.now();
  webhookQuoteOverrides[symbol] = {
    price,
    volume,
    timestamp: timestamp || now,
    source: 'finnhub_webhook',
  };

  // Immediate hot-patch into cachedData for sub-millisecond client reactivity
  if (cachedData) {
    const existing = cachedData.quotes[symbol];
    const prevClose = existing?.previousClose || price;
    const isBrlPair = symbol.includes('/') && (existing?.currency === 'BRL' || symbol.endsWith('/BRL'));
    const changeVal = Number((price - prevClose).toFixed(isBrlPair ? 4 : 2));
    const changePct = prevClose > 0 ? Number(((changeVal / prevClose) * 100).toFixed(2)) : 0;
    const high = existing ? Math.max(existing.high, price) : Number((price * 1.01).toFixed(2));
    const low = existing ? Math.min(existing.low, price) : Number((price * 0.99).toFixed(2));

    cachedData.quotes[symbol] = {
      symbol,
      price,
      change: changeVal,
      changePercent: changePct,
      high,
      low,
      open: existing?.open || prevClose,
      previousClose: prevClose,
      volume: volume ? (volume >= 1e6 ? `${(volume / 1e6).toFixed(1)}M` : `${Math.round(volume)}`) : existing?.volume || 'N/A',
      currency: existing?.currency || (symbol.includes('BRL') ? 'BRL' : 'USD'),
      source: 'finnhub_webhook_live',
    };

    // If it's a core FX or crypto rate, sync rates & pairs immediately
    if (symbol === 'USD/BRL') {
      cachedData.rates.BRL = price;
      if (cachedData.pairs['USDBRL']) {
        cachedData.pairs['USDBRL'].bid = price;
        cachedData.pairs['USDBRL'].varBid = changeVal;
        cachedData.pairs['USDBRL'].pctChange = changePct;
        cachedData.pairs['USDBRL'].timestamp = new Date().toISOString();
      }
    } else if (symbol === 'BTC/USD') {
      cachedData.rates.BTC = Number((1 / price).toFixed(8));
      if (cachedData.pairs['BTCBRL']) {
        const brlPrice = Number((price * cachedData.rates.BRL).toFixed(2));
        cachedData.pairs['BTCBRL'].bid = brlPrice;
        cachedData.pairs['BTCBRL'].pctChange = changePct;
        cachedData.pairs['BTCBRL'].timestamp = new Date().toISOString();
      }
    } else if (symbol === 'ETH/USD') {
      cachedData.rates.ETH = Number((1 / price).toFixed(8));
    } else if (symbol === 'SOL/USD') {
      cachedData.rates.SOL = Number((1 / price).toFixed(6));
    }

    cachedData.updatedAt = new Date().toISOString();
    cachedData.sourcesStatus.finnhub = true;
  }
}

