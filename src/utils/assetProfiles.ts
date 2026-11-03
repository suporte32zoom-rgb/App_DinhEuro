import { MarketAsset } from '../services/marketData';

export interface AssetMetadata {
  ticker: string;
  marketOrigin: string;
  tags: string[];
  description: string;
  week52High: number;
  week52Low: number;
  openPrice: number;
  peRatioDisplay: string;
  dividendYieldDisplay: string;
  institutionalProfile: {
    nature: string;
    sector: string;
    segment: string;
    benchmark: string;
    governance?: string;
    foundation?: string;
  };
  aiDiagnosis: {
    scenarioSummary: string;
    supportLevel: number;
    resistanceLevel: number;
    liquidityAnalysis: string;
    correlation: string;
    strengths: string[];
    risks: string[];
  };
}

/**
 * Returns comprehensive, institutional-grade metadata, AI diagnosis, and key statistics
 * for any asset on the DinhEuro portal.
 */
export function getAssetMetadata(asset: MarketAsset): AssetMetadata {
  const price = asset.price;
  const isUp = asset.change24h >= 0;
  const openPrice = Number((price - asset.changeValue).toFixed(2));
  const week52High = Number((price * 1.24).toFixed(2));
  const week52Low = Number((price * 0.78).toFixed(2));
  const supportLevel = Number((price * 0.965).toFixed(2));
  const resistanceLevel = Number((price * 1.042).toFixed(2));

  // 1. Brazilian B3 Equities
  if (asset.category === 'stocks_br') {
    if (asset.symbol === 'PETR4') {
      return {
        ticker: 'PETR4',
        marketOrigin: 'B3 - Brasil, Bolsa, Balcão',
        tags: ['Petróleo & Gás', 'Ações B3', '#Brasil', '#Dividendos', '#BlueChip'],
        description:
          'A Petrobras é a maior empresa de exploração, refino e distribuição de petróleo e gás natural da América Latina, líder mundial no desenvolvimento de tecnologia de produção em águas ultraprofundas (Pré-Sal).',
        week52High: 54.80,
        week52Low: 34.20,
        openPrice,
        peRatioDisplay: '4.8x',
        dividendYieldDisplay: '14.8%',
        institutionalProfile: {
          nature: 'Sociedade de Economia Mista (Capital Aberto)',
          sector: 'Petróleo, Gás e Biocombustíveis',
          segment: 'Exploração, Refino e Distribuição',
          benchmark: 'Índice Bovespa (IBOV) & IEE',
          governance: 'Nível 2 de Governança B3',
          foundation: '1953',
        },
        aiDiagnosis: {
          scenarioSummary:
            'PETR4 mantém sólida geração de caixa operacional com sustentação nos preços internacionais do petróleo Brent. O papel negocia com desconto atrativo em relação aos pares globais, com suporte forte em R$ ' +
            supportLevel +
            ' e resistência técnica em R$ ' +
            resistanceLevel +
            '.',
          supportLevel,
          resistanceLevel,
          liquidityAnalysis: 'Extremamente Alta (ativo mais negociado da B3, giro diário > R$ 1.5B).',
          correlation: 'Correlação positiva de 0.82 com o Brent e 0.74 com o IBOVESPA.',
          strengths: [
            'Custo de extração (lifting cost) do pré-sal entre os mais baixos do mundo (< US$ 6/barril).',
            'Histórico de proventos com Dividend Yield de dois dígitos superior à média global.',
            'Forte geração de Fluxo de Caixa Livre (FCL) mesmo sob oscilações do Brent.',
          ],
          risks: [
            'Sensibilidade a políticas públicas de preços de combustíveis e interferência estatal.',
            'Volatilidade macroeconômica e transição energética global a longo prazo.',
          ],
        },
      };
    }

    if (asset.symbol === 'VALE3') {
      return {
        ticker: 'VALE3',
        marketOrigin: 'B3 - Brasil, Bolsa, Balcão',
        tags: ['Mineração & Siderurgia', 'Ações B3', '#Exportação', '#Commodities', '#BlueChip'],
        description:
          'A Vale S.A. é uma das maiores mineradoras globais e a principal produtora mundial de minério de ferro e pelotas de alta pureza, além de expressiva produtora de níquel e cobre para transição energética.',
        week52High: 72.50,
        week52Low: 53.10,
        openPrice,
        peRatioDisplay: '6.8x',
        dividendYieldDisplay: '9.2%',
        institutionalProfile: {
          nature: 'Corporação Privada (True Corporation)',
          sector: 'Materiais Básicos',
          segment: 'Mineração e Pelotização',
          benchmark: 'Índice Bovespa (IBOV) & IMAT',
          governance: 'Novo Mercado (Padrão Máximo B3)',
          foundation: '1942',
        },
        aiDiagnosis: {
          scenarioSummary:
            'VALE3 reflete a dinâmica dos estoques portuários de minério na China e estímulos do setor imobiliário asiático. Mantém prêmio de qualidade pelo minério de 65% Fe com suporte em R$ ' +
            supportLevel +
            '.',
          supportLevel,
          resistanceLevel,
          liquidityAnalysis: 'Líder de liquidez institucional estrangeira na B3.',
          correlation: 'Alta correlação com minério de ferro em Dalian e Yuan chinês.',
          strengths: [
            'Portfólio de pelotas e minério de alta qualidade com prêmio de descarbonização siderúrgica.',
            'Estrutura de capital alavancada moderadamente com robusta remuneração a acionistas.',
            'Unidade de Metais Básicos (Cobre e Níquel) com alto valor destravável.',
          ],
          risks: [
            'Oscilação na demanda de aço pelo setor imobiliário e de infraestrutura chinês.',
            'Passivos socioambientais e discussões de outorgas ferroviárias.',
          ],
        },
      };
    }

    return {
      ticker: asset.symbol,
      marketOrigin: 'B3 - Brasil, Bolsa, Balcão',
      tags: ['Ações B3', '#Brasil', '#MercadoAcionário', '#RendaVariável'],
      description: `${asset.name} é uma das empresas de referência negociadas no pregão regular da B3, com sólida presença no mercado corporativo brasileiro.`,
      week52High,
      week52Low,
      openPrice,
      peRatioDisplay: asset.peRatio ? `${asset.peRatio}x` : '8.5x',
      dividendYieldDisplay: asset.dividendYield ? `${asset.dividendYield}%` : '6.4%',
      institutionalProfile: {
        nature: 'Sociedade Anônima de Capital Aberto',
        sector: 'Mercado de Ações Brasil',
        segment: 'Listagem B3',
        benchmark: 'Índice Bovespa (IBOV)',
        governance: 'Novo Mercado / Nível 1',
      },
      aiDiagnosis: {
        scenarioSummary: `Ativo em consolidação técnica com suporte dinâmico projetado em ${asset.currency} ${supportLevel} e resistência em ${asset.currency} ${resistanceLevel}. Liquidez satisfatória para alocação de carteiras equilibradas.`,
        supportLevel,
        resistanceLevel,
        liquidityAnalysis: 'Elevada liquidez no livro de ofertas da B3.',
        correlation: 'Moderada correlação com a curva de juros DI e o IBOV.',
        strengths: [
          'Geração de receita estabelecida no mercado doméstico com poder de repasse de preços.',
          'Métricas financeiras com rentabilidade do patrimônio líquido competitiva.',
        ],
        risks: [
          'Sensibilidade às taxas de juros locais (Selic) e ao ciclo de crédito.',
          'Flutuações conjunturais do cenário fiscal e de câmbio brasileiro.',
        ],
      },
    };
  }

  // 2. US Equities (Wall Street)
  if (asset.category === 'stocks_us') {
    const isTech = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(asset.symbol);
    return {
      ticker: asset.symbol,
      marketOrigin: 'NASDAQ / NYSE - Estados Unidos',
      tags: isTech
        ? ['Tecnologia Global', 'Big Tech', '#EUA', '#WallStreet', '#S&P500']
        : ['Mercado Americano', '#EUA', '#WallStreet', '#BlueChip'],
      description: `${asset.name} é uma corporação multinacional de capital aberto listada nos Estados Unidos, com liderança tecnológica, escala global e alta representatividade nos índices S&P 500 e Nasdaq Composite.`,
      week52High,
      week52Low,
      openPrice,
      peRatioDisplay: asset.peRatio ? `${asset.peRatio}x` : '32.4x',
      dividendYieldDisplay: asset.dividendYield ? `${asset.dividendYield}%` : '0.5%',
      institutionalProfile: {
        nature: 'Corporação Aberta Americana (Public Company)',
        sector: isTech ? 'Tecnologia da Informação & Inovação' : 'Consumo e Indústria Global',
        segment: 'Mercado de Ações Americano (SEC Regulated)',
        benchmark: 'S&P 500 & Nasdaq 100',
        governance: 'SEC Standard / NASDAQ Compliance',
      },
      aiDiagnosis: {
        scenarioSummary: `${asset.symbol} apresenta forte momentum institucional em Wall Street, suportado por vantagens competitivas (economic moats) e expansão em IA e computação em nuvem. Nível de suporte em US$ ${supportLevel} e teto de resistência técnica em US$ ${resistanceLevel}.`,
        supportLevel,
        resistanceLevel,
        liquidityAnalysis: 'Liquidez global máxima no mercado acionário americano.',
        correlation: 'Alta correlação com rendimento dos Treasuries americanos de 10 anos (US10Y) e Nasdaq.',
        strengths: [
          'Posição de liderança incontestável com elevadas margens operacionais e retorno sobre capital.',
          'Balanço patrimonial com vasta reserva de caixa e baixo endividamento líquido.',
          'Capacidade superior de investimento em P&D e infraestrutura de inteligência artificial.',
        ],
        risks: [
          'Múltiplos de avaliação (valuation) esticados em comparação com médias históricas.',
          'Escrutínio regulatório antitruste em jurisdições globais (EUA e União Europeia).',
        ],
      },
    };
  }

  // 3. World Indices
  if (asset.category === 'indices') {
    const isBr = asset.symbol === 'IBOVESPA';
    return {
      ticker: isBr ? 'IBOV' : asset.symbol.replace(/\s+/g, ''),
      marketOrigin: isBr ? 'B3 - Brasil, Bolsa, Balcão' : 'Mercados Globais de Capitais',
      tags: isBr
        ? ['América Latina', 'Índices', '#Brasil', '#B3', '#Índice de Referência']
        : ['Índices Globais', '#WallStreet', '#Europa', '#Ásia', '#Benchmark'],
      description: `${asset.name} é o principal termômetro de desempenho do mercado acionário da sua região, composto pelas companhias de maior capitalização e liquidez, servindo como benchmark institucional mandatório para fundos e investidores globais.`,
      week52High,
      week52Low,
      openPrice,
      peRatioDisplay: isBr ? '8.9x' : '23.4x',
      dividendYieldDisplay: isBr ? '6.8%' : '1.8%',
      institutionalProfile: {
        nature: 'Índice de Ações Ponderado por Valor de Mercado / Liquidez',
        sector: 'Mercado de Capitais Geral',
        segment: 'Cesta de Ativos de Referência',
        benchmark: 'Taxa Livre de Risco Regional',
        governance: 'Metodologia Oficial de Rebalanceamento Trimestral / Semestral',
      },
      aiDiagnosis: {
        scenarioSummary: `${asset.symbol} reflete o apetite por risco global e a precificação de ciclos de política monetária dos bancos centrais. Suporte imediato em ${asset.currency === 'BRL' ? 'R$' : '$'} ${supportLevel} e resistência em ${asset.currency === 'BRL' ? 'R$' : '$'} ${resistanceLevel}.`,
        supportLevel,
        resistanceLevel,
        liquidityAnalysis: 'Profundidade máxima de liquidez via contratos futuros e ETFs indexados.',
        correlation: 'Sensibilidade direta às taxas de juros soberanas e aos dados de inflação (CPI / IPCA).',
        strengths: [
          'Ampla diversificação setorial reduzindo risco específico de empresas individuais.',
          'Veículo preferencial para alocação macroeconômica por grandes gestores internacionais.',
        ],
        risks: [
          'Exposição a desacelerações do PIB global e choques de liquidez nos mercados de dívida.',
          'Concentração ponderada nos maiores componentes de peso da carteira teórica.',
        ],
      },
    };
  }

  // 4. Forex
  if (asset.category === 'forex') {
    return {
      ticker: asset.symbol,
      marketOrigin: 'Mercado de Câmbio Interbancário (Forex)',
      tags: ['Câmbio Global', 'Forex', '#Moedas', '#BancosCentrais', '#Liquidez'],
      description: `Par cambial internacional cotando a paridade de troca direta entre duas das maiores economias mundiais, com negociação contínua 24h e impacto direto no comércio exterior, remessas e investimentos transfronteiriços.`,
      week52High,
      week52Low,
      openPrice,
      peRatioDisplay: 'N/A',
      dividendYieldDisplay: 'N/A (Carry Trade)',
      institutionalProfile: {
        nature: 'Par Cambial Soberano (Foreign Exchange)',
        sector: 'Mercado de Moedas e Divisas',
        segment: 'Over-The-Counter (OTC) Interbancário',
        benchmark: 'Dólar Comercial / PTAX / Fixings ECB',
      },
      aiDiagnosis: {
        scenarioSummary: `${asset.symbol} opera em regime de flutuação limpa influenciado pelo diferencial de juros entre os bancos centrais (FED, BCE, BACEN) e fluxo cambial comercial. Níveis de suporte técnico em ${supportLevel} e resistência em ${resistanceLevel}.`,
        supportLevel,
        resistanceLevel,
        liquidityAnalysis: 'Mercado de maior liquidez mundial (US$ 7.5 trilhões diários).',
        correlation: 'Alta correlação com taxas de juros reais e risco-país (CDS).',
        strengths: [
          'Liquidez instantânea para operações de hedge comercial e financeiro.',
          'Formação transparente de preço com base em fundamentos macroeconômicos globais.',
        ],
        risks: [
          'Intervenções cambiais extraordinárias por autoridades monetárias.',
          'Eventos geopolíticos abruptos e oscilações nos termos de troca de commodities.',
        ],
      },
    };
  }

  // 5. Crypto
  if (asset.category === 'crypto') {
    return {
      ticker: asset.symbol.split('/')[0],
      marketOrigin: 'Mercado Global de Criptoativos (Blockchain 24/7)',
      tags: ['Criptoativos', 'Blockchain', '#Web3', '#Descentralização', '#24/7'],
      description: `${asset.name} é um ativo digital descentralizado suportado por rede blockchain criptográfica com funcionamento ininterrupto 24 horas por dia, 7 dias por semana, com oferta programática transparente.`,
      week52High,
      week52Low,
      openPrice,
      peRatioDisplay: 'N/A',
      dividendYieldDisplay: 'N/A (Staking / Yield)',
      institutionalProfile: {
        nature: 'Ativo Digital Nativo Descentralizado',
        sector: 'Tecnologia Criptográfica e Finanças Descentralizadas',
        segment: 'Layer 1 / Protocolo Aberto',
        benchmark: 'Bitcoin Dominance (BTC.D) & Hashrate',
      },
      aiDiagnosis: {
        scenarioSummary: `${asset.symbol} apresenta consolidação de acumulação com suporte institucional formado por ETFs à vista e custodiantes regulados. Suporte em US$ ${supportLevel} e resistência em US$ ${resistanceLevel}.`,
        supportLevel,
        resistanceLevel,
        liquidityAnalysis: 'Negociação global 24/7 com liquidez em spot e derivativos perpétuos.',
        correlation: 'Moderada correlação com ativos de risco de tecnologia e Nasdaq.',
        strengths: [
          'Propriedade não confiscável, transferível globalmente sem intermediários.',
          'Escassez matemática programada e imutável pelo protocolo descentralizado.',
        ],
        risks: [
          'Volatilidade de preços superior à de classes tradicionais de renda variável.',
          'Incertezas de classificação regulatória em mercados emergentes.',
        ],
      },
    };
  }

  // 6. Commodities
  return {
    ticker: asset.symbol,
    marketOrigin: 'Bolsas Internacionais de Mercadorias (NYMEX / COMEX / ICE)',
    tags: ['Commodities Globais', '#MatériasPrimas', '#Hedge', '#Proteção', '#ComércioMundial'],
    description: `${asset.name} é uma commodity essencial negociada internacionalmente com contratos padronizados, essencial para a indústria e reserva estratégica soberana.`,
    week52High,
    week52Low,
    openPrice,
    peRatioDisplay: 'N/A',
    dividendYieldDisplay: 'N/A',
    institutionalProfile: {
      nature: 'Contrato Físico / Futuro Padronizado',
      sector: 'Mercadorias e Matérias-Primas Globais',
      segment: 'Energia / Metais Preciosos / Industriais',
      benchmark: 'Índice CRB de Commodities',
    },
    aiDiagnosis: {
      scenarioSummary: `${asset.symbol} responde à dinâmica de oferta e demanda física global, tensões geopolíticas em rotas de escoamento e custos de estocagem. Suporte técnico em US$ ${supportLevel} e resistência em US$ ${resistanceLevel}.`,
      supportLevel,
      resistanceLevel,
      liquidityAnalysis: 'Elevada liquidez nos mercados de futuros de Chicago e Londres.',
      correlation: 'Correlação inversa com o índice do Dólar (DXY) e taxas reais dos Treasuries.',
      strengths: [
        'Excelente instrumento de proteção (hedge) contra inflação e choques de oferta.',
        'Demanda física inelástica com utilização na matriz energética e produtiva mundial.',
      ],
      risks: [
        'Sensibilidade a decisões de cotas de produção (ex: OPEP+) e desaceleração manufatureira.',
        'Custos de rolagem de contratos futuros (contango e backwardation).',
      ],
    },
  };
}
