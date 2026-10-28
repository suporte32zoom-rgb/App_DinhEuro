/**
 * DinhEuro Market Data Service
 * Primary API: Finnhub (finnhub.io)
 * Secondary: Frankfurter / ECB Public Engine
 * ZERO AwesomeAPI used.
 */

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'indices' | 'stocks_us' | 'stocks_br' | 'forex' | 'crypto' | 'commodities';
  price: number;
  currency: string;
  change24h: number; // in percentage
  changeValue: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
  sparkline: number[];
  flag?: string; // country code or flag emoji
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: 'Geral' | 'Câmbio' | 'Ações' | 'Cripto' | 'Macro';
  datetime: string;
  imageUrl?: string;
}

export interface UniversalRates {
  [currency: string]: number; // Value relative to USD (USD = 1.0)
}

// Initial robust universal base rates (1 USD = X Currency)
export const DEFAULT_UNIVERSAL_RATES: UniversalRates = {
  USD: 1.0,
  BRL: 5.485,
  EUR: 0.922,
  GBP: 0.774,
  JPY: 152.35,
  CHF: 0.865,
  CAD: 1.385,
  AUD: 1.518,
  CNY: 7.125,
  BTC: 0.0000148, // ~67,500 USD per BTC
  ETH: 0.000385,  // ~2,600 USD per ETH
};

// Initial base assets for immediate high-fidelity rendering
export const INITIAL_ASSETS: MarketAsset[] = [
  // Índices Mundiais
  {
    id: 'sp500',
    symbol: 'S&P 500',
    name: 'Standard & Poor\'s 500 Index',
    category: 'indices',
    price: 5864.67,
    currency: 'USD',
    change24h: 0.42,
    changeValue: 24.50,
    high24h: 5878.10,
    low24h: 5845.20,
    volume: '$38.4B',
    sparkline: [5830, 5840, 5835, 5855, 5860, 5850, 5864],
    flag: '🇺🇸',
  },
  {
    id: 'nasdaq',
    symbol: 'NASDAQ',
    name: 'Nasdaq Composite',
    category: 'indices',
    price: 18518.61,
    currency: 'USD',
    change24h: 0.78,
    changeValue: 143.20,
    high24h: 18560.40,
    low24h: 18390.10,
    volume: '$62.1B',
    sparkline: [18350, 18400, 18430, 18490, 18460, 18518],
    flag: '🇺🇸',
  },
  {
    id: 'dowjones',
    symbol: 'DOW JONES',
    name: 'Dow Jones Industrial Average',
    category: 'indices',
    price: 42387.57,
    currency: 'USD',
    change24h: -0.33,
    changeValue: -140.50,
    high24h: 42520.00,
    low24h: 42310.20,
    volume: '$14.2B',
    sparkline: [42500, 42480, 42420, 42350, 42390, 42387],
    flag: '🇺🇸',
  },
  {
    id: 'ibovespa',
    symbol: 'IBOVESPA',
    name: 'Índice Bovespa (Brasil B3)',
    category: 'indices',
    price: 130845.20,
    currency: 'BRL',
    change24h: 0.65,
    changeValue: 845.00,
    high24h: 131200.00,
    low24h: 129980.00,
    volume: 'R$ 24.8B',
    sparkline: [129900, 130200, 130100, 130600, 130750, 130845],
    flag: '🇧🇷',
  },
  {
    id: 'dax',
    symbol: 'DAX 40',
    name: 'Frankfurt Stock Exchange Index',
    category: 'indices',
    price: 19478.11,
    currency: 'EUR',
    change24h: 0.35,
    changeValue: 68.20,
    high24h: 19510.00,
    low24h: 19410.50,
    volume: '€ 11.5B',
    sparkline: [19390, 19420, 19440, 19460, 19450, 19478],
    flag: '🇩🇪',
  },
  {
    id: 'ftse100',
    symbol: 'FTSE 100',
    name: 'London Stock Exchange Index',
    category: 'indices',
    price: 8249.30,
    currency: 'GBP',
    change24h: -0.15,
    changeValue: -12.40,
    high24h: 8275.00,
    low24h: 8230.10,
    volume: '£ 8.1B',
    sparkline: [8260, 8265, 8250, 8240, 8245, 8249],
    flag: '🇬🇧',
  },
  {
    id: 'nikkei',
    symbol: 'NIKKEI 225',
    name: 'Tokyo Stock Exchange',
    category: 'indices',
    price: 38605.53,
    currency: 'JPY',
    change24h: 1.82,
    changeValue: 691.00,
    high24h: 38750.00,
    low24h: 37950.00,
    volume: '¥ 4.2T',
    sparkline: [37900, 38100, 38350, 38500, 38580, 38605],
    flag: '🇯🇵',
  },

  // Forex & Câmbio Global
  {
    id: 'eur_brl',
    symbol: 'EUR/BRL',
    name: 'Euro / Real Brasileiro',
    category: 'forex',
    price: 5.9485,
    currency: 'BRL',
    change24h: 0.38,
    changeValue: 0.0225,
    high24h: 5.9620,
    low24h: 5.9210,
    volume: '€ 850M',
    sparkline: [5.92, 5.93, 5.925, 5.94, 5.95, 5.9485],
    flag: '🇪🇺🇧🇷',
  },
  {
    id: 'usd_brl',
    symbol: 'USD/BRL',
    name: 'Dólar Americano / Real Brasileiro',
    category: 'forex',
    price: 5.4850,
    currency: 'BRL',
    change24h: 0.25,
    changeValue: 0.0137,
    high24h: 5.5100,
    low24h: 5.4620,
    volume: '$2.4B',
    sparkline: [5.46, 5.47, 5.48, 5.475, 5.49, 5.485],
    flag: '🇺🇸🇧🇷',
  },
  {
    id: 'eur_usd',
    symbol: 'EUR/USD',
    name: 'Euro / Dólar Americano',
    category: 'forex',
    price: 1.0845,
    currency: 'USD',
    change24h: 0.12,
    changeValue: 0.0013,
    high24h: 1.0870,
    low24h: 1.0815,
    volume: '$480B',
    sparkline: [1.082, 1.083, 1.084, 1.0835, 1.085, 1.0845],
    flag: '🇪🇺🇺🇸',
  },
  {
    id: 'gbp_brl',
    symbol: 'GBP/BRL',
    name: 'Libra Esterlina / Real Brasileiro',
    category: 'forex',
    price: 7.0865,
    currency: 'BRL',
    change24h: -0.18,
    changeValue: -0.0128,
    high24h: 7.1120,
    low24h: 7.0650,
    volume: '£ 320M',
    sparkline: [7.10, 7.09, 7.095, 7.08, 7.075, 7.0865],
    flag: '🇬🇧🇧🇷',
  },
  {
    id: 'usd_jpy',
    symbol: 'USD/JPY',
    name: 'Dólar Americano / Iene Japonês',
    category: 'forex',
    price: 152.35,
    currency: 'JPY',
    change24h: -0.45,
    changeValue: -0.69,
    high24h: 153.20,
    low24h: 151.90,
    volume: '$290B',
    sparkline: [153.1, 152.8, 152.5, 152.2, 152.4, 152.35],
    flag: '🇺🇸🇯🇵',
  },
  {
    id: 'chf_brl',
    symbol: 'CHF/BRL',
    name: 'Franco Suíço / Real Brasileiro',
    category: 'forex',
    price: 6.3410,
    currency: 'BRL',
    change24h: 0.19,
    changeValue: 0.0120,
    high24h: 6.3600,
    low24h: 6.3150,
    volume: 'CHF 140M',
    sparkline: [6.32, 6.33, 6.335, 6.345, 6.34, 6.341],
    flag: '🇨🇭🇧🇷',
  },

  // Ações Globais (US)
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stocks_us',
    price: 231.41,
    currency: 'USD',
    change24h: 1.15,
    changeValue: 2.63,
    high24h: 232.80,
    low24h: 228.90,
    volume: '$7.8B',
    marketCap: '$3.52T',
    peRatio: 34.2,
    dividendYield: 0.44,
    sparkline: [228, 229.5, 230, 231, 230.5, 231.41],
    flag: '🇺🇸',
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'stocks_us',
    price: 140.52,
    currency: 'USD',
    change24h: 3.28,
    changeValue: 4.46,
    high24h: 142.20,
    low24h: 136.80,
    volume: '$19.4B',
    marketCap: '$3.44T',
    peRatio: 64.1,
    dividendYield: 0.03,
    sparkline: [135, 137, 138.5, 139, 141, 140.52],
    flag: '🇺🇸',
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'stocks_us',
    price: 428.15,
    currency: 'USD',
    change24h: 0.82,
    changeValue: 3.48,
    high24h: 430.50,
    low24h: 424.30,
    volume: '$6.1B',
    marketCap: '$3.18T',
    peRatio: 35.8,
    dividendYield: 0.78,
    sparkline: [424, 425.5, 427, 426, 428.15],
    flag: '🇺🇸',
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc. (Google)',
    category: 'stocks_us',
    price: 168.34,
    currency: 'USD',
    change24h: 1.45,
    changeValue: 2.41,
    high24h: 169.80,
    low24h: 166.10,
    volume: '$4.2B',
    marketCap: '$2.09T',
    peRatio: 24.5,
    dividendYield: 0.48,
    sparkline: [165, 166.2, 167, 167.8, 168.34],
    flag: '🇺🇸',
  },
  {
    id: 'amzn',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'stocks_us',
    price: 187.89,
    currency: 'USD',
    change24h: -0.42,
    changeValue: -0.79,
    high24h: 190.20,
    low24h: 186.70,
    volume: '$5.5B',
    marketCap: '$1.97T',
    peRatio: 43.8,
    dividendYield: 0.0,
    sparkline: [189, 188.5, 187.2, 188.1, 187.89],
    flag: '🇺🇸',
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'stocks_us',
    price: 269.19,
    currency: 'USD',
    change24h: 4.12,
    changeValue: 10.65,
    high24h: 272.50,
    low24h: 258.40,
    volume: '$14.9B',
    marketCap: '$859B',
    peRatio: 72.3,
    dividendYield: 0.0,
    sparkline: [255, 260, 264, 266, 270, 269.19],
    flag: '🇺🇸',
  },

  // Ações Brasil (B3)
  {
    id: 'petr4',
    symbol: 'PETR4',
    name: 'Petróleo Brasileiro S.A. - Petrobras',
    category: 'stocks_br',
    price: 36.42,
    currency: 'BRL',
    change24h: 1.62,
    changeValue: 0.58,
    high24h: 36.80,
    low24h: 35.90,
    volume: 'R$ 1.8B',
    marketCap: 'R$ 475B',
    peRatio: 4.8,
    dividendYield: 15.2,
    sparkline: [35.8, 36.0, 36.2, 36.1, 36.42],
    flag: '🇧🇷',
  },
  {
    id: 'vale3',
    symbol: 'VALE3',
    name: 'Vale S.A.',
    category: 'stocks_br',
    price: 61.20,
    currency: 'BRL',
    change24h: -0.85,
    changeValue: -0.52,
    high24h: 62.10,
    low24h: 60.80,
    volume: 'R$ 1.2B',
    marketCap: 'R$ 277B',
    peRatio: 6.2,
    dividendYield: 9.8,
    sparkline: [62.0, 61.7, 61.4, 60.9, 61.2],
    flag: '🇧🇷',
  },
  {
    id: 'itub4',
    symbol: 'ITUB4',
    name: 'Itaú Unibanco Holding S.A.',
    category: 'stocks_br',
    price: 35.85,
    currency: 'BRL',
    change24h: 0.95,
    changeValue: 0.34,
    high24h: 36.10,
    low24h: 35.40,
    volume: 'R$ 820M',
    marketCap: 'R$ 351B',
    peRatio: 8.7,
    dividendYield: 7.2,
    sparkline: [35.3, 35.5, 35.6, 35.75, 35.85],
    flag: '🇧🇷',
  },
  {
    id: 'wege3',
    symbol: 'WEGE3',
    name: 'WEG S.A.',
    category: 'stocks_br',
    price: 54.30,
    currency: 'BRL',
    change24h: 2.15,
    changeValue: 1.14,
    high24h: 54.80,
    low24h: 53.10,
    volume: 'R$ 640M',
    marketCap: 'R$ 228B',
    peRatio: 36.4,
    dividendYield: 1.4,
    sparkline: [53.0, 53.4, 53.9, 54.1, 54.3],
    flag: '🇧🇷',
  },
  {
    id: 'bbdc4',
    symbol: 'BBDC4',
    name: 'Banco Bradesco S.A.',
    category: 'stocks_br',
    price: 14.82,
    currency: 'BRL',
    change24h: -0.27,
    changeValue: -0.04,
    high24h: 15.02,
    low24h: 14.70,
    volume: 'R$ 490M',
    marketCap: 'R$ 158B',
    peRatio: 10.1,
    dividendYield: 6.8,
    sparkline: [14.9, 14.85, 14.78, 14.8, 14.82],
    flag: '🇧🇷',
  },
  {
    id: 'bbas3',
    symbol: 'BBAS3',
    name: 'Banco do Brasil S.A.',
    category: 'stocks_br',
    price: 27.65,
    currency: 'BRL',
    change24h: 1.28,
    changeValue: 0.35,
    high24h: 27.90,
    low24h: 27.20,
    volume: 'R$ 580M',
    marketCap: 'R$ 158B',
    peRatio: 4.2,
    dividendYield: 10.5,
    sparkline: [27.1, 27.3, 27.5, 27.4, 27.65],
    flag: '🇧🇷',
  },

  // Criptomoedas
  {
    id: 'btc',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'crypto',
    price: 67845.00,
    currency: 'USD',
    change24h: 2.85,
    changeValue: 1880.00,
    high24h: 68450.00,
    low24h: 65900.00,
    volume: '$34.2B',
    marketCap: '$1.34T',
    sparkline: [65800, 66400, 67100, 66800, 67400, 67845],
    flag: '🌐',
  },
  {
    id: 'eth',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    category: 'crypto',
    price: 2618.40,
    currency: 'USD',
    change24h: 1.94,
    changeValue: 49.80,
    high24h: 2650.00,
    low24h: 2550.00,
    volume: '$16.8B',
    marketCap: '$315B',
    sparkline: [2560, 2580, 2605, 2590, 2618.4],
    flag: '🌐',
  },
  {
    id: 'sol',
    symbol: 'SOL/USD',
    name: 'Solana',
    category: 'crypto',
    price: 178.60,
    currency: 'USD',
    change24h: 4.65,
    changeValue: 7.94,
    high24h: 182.00,
    low24h: 169.50,
    volume: '$4.1B',
    marketCap: '$84B',
    sparkline: [168, 172, 174, 176, 178.6],
    flag: '🌐',
  },
  {
    id: 'bnb',
    symbol: 'BNB/USD',
    name: 'BNB (Binance)',
    category: 'crypto',
    price: 594.30,
    currency: 'USD',
    change24h: 0.88,
    changeValue: 5.18,
    high24h: 601.00,
    low24h: 588.00,
    volume: '$1.2B',
    marketCap: '$86B',
    sparkline: [588, 590, 593, 592, 594.3],
    flag: '🌐',
  },

  // Commodities
  {
    id: 'gold',
    symbol: 'OURO (XAU)',
    name: 'Ouro Spot / Onça Troy',
    category: 'commodities',
    price: 2748.90,
    currency: 'USD',
    change24h: 0.86,
    changeValue: 23.40,
    high24h: 2758.50,
    low24h: 2724.00,
    volume: '$62B',
    sparkline: [2720, 2732, 2740, 2738, 2748.9],
    flag: '🥇',
  },
  {
    id: 'brent',
    symbol: 'BRENT',
    name: 'Petróleo Brent Contrato Futuro',
    category: 'commodities',
    price: 74.29,
    currency: 'USD',
    change24h: -1.25,
    changeValue: -0.94,
    high24h: 75.80,
    low24h: 73.90,
    volume: '$18B',
    sparkline: [75.8, 75.2, 74.8, 74.5, 74.29],
    flag: '🛢️',
  },
  {
    id: 'wti',
    symbol: 'WTI',
    name: 'Petróleo WTI (Texas)',
    category: 'commodities',
    price: 70.42,
    currency: 'USD',
    change24h: -1.38,
    changeValue: -0.98,
    high24h: 71.90,
    low24h: 69.95,
    volume: '$16B',
    sparkline: [71.8, 71.3, 70.9, 70.6, 70.42],
    flag: '🛢️',
  },
  {
    id: 'silver',
    symbol: 'PRATA (XAG)',
    name: 'Prata Spot / Onça Troy',
    category: 'commodities',
    price: 33.72,
    currency: 'USD',
    change24h: 1.45,
    changeValue: 0.48,
    high24h: 34.10,
    low24h: 33.15,
    volume: '$8.5B',
    sparkline: [33.1, 33.3, 33.5, 33.4, 33.72],
    flag: '🥈',
  },
];

// Authoritative Financial News items with real external URLs
export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'BCE mantém sinalização de corte gradual de juros com inflação da Zona do Euro perto de 2%',
    summary: 'A presidente Christine Lagarde reiterou em coletiva em Frankfurt que o processo desinflacionário está bem encaminhado no bloco europeu, impulsionando os mercados de dívida soberana e o câmbio.',
    source: 'Bloomberg Línea',
    url: 'https://www.bloomberglinea.com.br/mercados/',
    category: 'Macro',
    datetime: 'Há 18 minutos',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'news_2',
    title: 'Ibovespa avança com alta da Petrobras e apoio de commodities em dia de cautela fiscal',
    summary: 'O principal índice da B3 fechou em terreno positivo, impulsionado pelas ações ordinárias e preferenciais da Petrobras e apetite por ativos ligados a energia e infraestrutura.',
    source: 'Valor Econômico',
    url: 'https://valor.globo.com/financas/',
    category: 'Ações',
    datetime: 'Há 32 minutos',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'news_3',
    title: 'Dólar e Euro oscilam frente ao Real com investidores de olho no pacote de corte de gastos',
    summary: 'Moedas globais mantêm volatilidade enquanto o Ministério da Fazenda finaliza as medidas estruturais para sustentabilidade do arcabouço fiscal brasileiro.',
    source: 'Reuters Brasil',
    url: 'https://www.reuters.com/markets/currencies/',
    category: 'Câmbio',
    datetime: 'Há 45 minutos',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'news_4',
    title: 'Big Techs e corrida de Inteligência Artificial impulsionam Nasdaq e S&P 500 em Wall Street',
    summary: 'Ações da Nvidia, Apple e Microsoft sustentam ganhos expressivos nos índices norte-americanos em meio aos balanços corporativos do trimestre.',
    source: 'Financial Times',
    url: 'https://www.ft.com/markets',
    category: 'Ações',
    datetime: 'Há 1 hora',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'news_5',
    title: 'Bitcoin testa resistência chave com fluxo recorde em ETFs à vista e expectativa macroeconômica',
    summary: 'O maior ativo digital do mundo avança com forte entrada de capital institucional e volume negociado nos fundos de índice listados nos Estados Unidos.',
    source: 'CoinDesk',
    url: 'https://www.coindesk.com/markets/',
    category: 'Cripto',
    datetime: 'Há 1 hora e 20 minutos',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'news_6',
    title: 'Ouro renova máximas históricas impulsionado por demanda de bancos centrais e busca por reserva de valor',
    summary: 'A onça troy do metal precioso ultrapassa patamares inéditos com desdolarização parcial de reservas internacionais e tensões geopolíticas no Oriente Médio.',
    source: 'InfoMoney',
    url: 'https://www.infomoney.com.br/mercados/',
    category: 'Geral',
    datetime: 'Há 2 horas',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Storage helpers for Finnhub configuration and User Portfolio
 */
const FINNHUB_KEY_STORAGE = 'dinheuro_finnhub_key';

export function getStoredFinnhubKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(FINNHUB_KEY_STORAGE) || '';
}

export function setStoredFinnhubKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(FINNHUB_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(FINNHUB_KEY_STORAGE);
  }
}

/**
 * Real-time API Fetcher:
 * Tries Finnhub API if key is available, and supplements with public ECB/Frankfurter API for forex rates.
 */
export async function fetchLiveExchangeRates(apiKey?: string): Promise<UniversalRates> {
  const token = apiKey || getStoredFinnhubKey();

  // Try fetching live rates from Frankfurter (ECB open data engine) for authentic live USD base rates
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        return {
          USD: 1.0,
          BRL: data.rates.BRL || DEFAULT_UNIVERSAL_RATES.BRL,
          EUR: data.rates.EUR || DEFAULT_UNIVERSAL_RATES.EUR,
          GBP: data.rates.GBP || DEFAULT_UNIVERSAL_RATES.GBP,
          JPY: data.rates.JPY || DEFAULT_UNIVERSAL_RATES.JPY,
          CHF: data.rates.CHF || DEFAULT_UNIVERSAL_RATES.CHF,
          CAD: data.rates.CAD || DEFAULT_UNIVERSAL_RATES.CAD,
          AUD: data.rates.AUD || DEFAULT_UNIVERSAL_RATES.AUD,
          CNY: data.rates.CNY || DEFAULT_UNIVERSAL_RATES.CNY,
          BTC: DEFAULT_UNIVERSAL_RATES.BTC,
          ETH: DEFAULT_UNIVERSAL_RATES.ETH,
        };
      }
    }
  } catch (err) {
    console.warn('[DinhEuro] Fallback to standard rates engine:', err);
  }

  // If Finnhub key provided, we can fetch Finnhub forex rates
  if (token) {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.quote) {
          return {
            ...DEFAULT_UNIVERSAL_RATES,
            ...data.quote,
            USD: 1.0,
          };
        }
      }
    } catch (err) {
      console.warn('[DinhEuro] Finnhub forex fetch failed, retaining robust rate table:', err);
    }
  }

  return DEFAULT_UNIVERSAL_RATES;
}

export interface FinnhubQuoteResult {
  simbolo: string;
  precoAtual: number;          // Current price (data.c)
  variacao: number;            // Change (data.d)
  percentualVariacao: number;  // Percent change (data.dp)
  maximaDia: number;           // High price of the day (data.h)
  minimaDia: number;           // Low price of the day (data.l)
  abertura: number;            // Open price of the day (data.o)
  fechamentoAnterior: number;  // Previous close price (data.pc)
}

/**
 * Busca a cotação em tempo real de um ativo (Ação, Forex ou Cripto) via Finnhub API
 * @param symbol Ex: 'AAPL' (Apple), 'BINANCE:BTCUSDT' (Bitcoin)
 * @param apiKey Chave opcional ou lida das configurações salvas
 */
export async function obterCotacaoFinnhub(
  symbol: string,
  apiKey?: string
): Promise<FinnhubQuoteResult | null> {
  const token = apiKey || getStoredFinnhubKey() || (import.meta as any).env?.VITE_FINNHUB_API_KEY || '';
  if (!token) return null;

  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP: status ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.c === undefined || data.c === 0) {
      return null;
    }

    // Formatação dos dados retornados pela Finnhub
    const resultado: FinnhubQuoteResult = {
      simbolo: symbol,
      precoAtual: data.c,
      variacao: data.d,
      percentualVariacao: data.dp,
      maximaDia: data.h,
      minimaDia: data.l,
      abertura: data.o,
      fechamentoAnterior: data.pc,
    };

    return resultado;
  } catch (error) {
    console.error(`Erro ao buscar cotação para ${symbol}:`, error);
    return null;
  }
}

/**
 * Generate synthetic continuous candlestick data for any asset
 */
export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function generateAssetCandles(currentPrice: number, timeframe: string): CandlePoint[] {
  let count = 24;
  let intervalMinutes = 60;

  if (timeframe === '1D') {
    count = 24;
    intervalMinutes = 60;
  } else if (timeframe === '5D') {
    count = 30;
    intervalMinutes = 240;
  } else if (timeframe === '1M') {
    count = 30;
    intervalMinutes = 1440;
  } else if (timeframe === '6M') {
    count = 26;
    intervalMinutes = 1440 * 7;
  } else if (timeframe === '1A') {
    count = 52;
    intervalMinutes = 1440 * 7;
  } else {
    count = 60;
    intervalMinutes = 1440 * 30;
  }

  const candles: CandlePoint[] = [];
  let price = currentPrice * 0.95; // start slightly below
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timeStamp = new Date(now - i * intervalMinutes * 60 * 1000);
    const variance = (Math.random() - 0.48) * (price * 0.02);
    const open = price;
    const close = Math.max(0.01, open + variance);
    const high = Math.max(open, close) + Math.random() * (price * 0.008);
    const low = Math.min(open, close) - Math.random() * (price * 0.008);
    const volume = Math.floor(Math.random() * 50000 + 10000);

    candles.push({
      time: timeframe === '1D'
        ? timeStamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : timeStamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  // Ensure last close matches current price
  if (candles.length > 0) {
    candles[candles.length - 1].close = currentPrice;
  }

  return candles;
}
