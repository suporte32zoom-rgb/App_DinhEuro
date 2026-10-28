import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Star,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Broker {
  id: string;
  name: string;
  category: 'global' | 'brasil' | 'crypto';
  logoText: string;
  badge?: string;
  rating: number;
  description: string;
  spreadCambio: string;
  brokerageFee: string;
  regulation: string;
  minDeposit: string;
  features: string[];
  websiteUrl: string;
}

export const BrokersView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'global' | 'brasil' | 'crypto'>('all');

  const brokers: Broker[] = [
    {
      id: 'ibkr',
      name: 'Interactive Brokers (IBKR)',
      category: 'global',
      logoText: 'IBKR',
      badge: 'Líder Mundial',
      rating: 4.9,
      description:
        'Acesso direto a mais de 150 mercados em 33 países. Negocie ações nos EUA, Europa em Euros, Ásia, títulos e moedas com as menores taxas do mercado financeiro.',
      spreadCambio: 'A partir de 0,1% (taxa interbancária direta)',
      brokerageFee: 'A partir de $0.005 / ação',
      regulation: 'SEC, FINRA, SIPC, FCA, BaFin',
      minDeposit: '$0 (Sem mínimo)',
      features: [
        'Acesso a bolsas europeias (DAX, Euronext, LSE)',
        'Rendimento sobre saldo de caixa em dólar e euro',
        'Plataforma profissional Trader Workstation (TWS)',
      ],
      websiteUrl: 'https://www.interactivebrokers.com',
    },
    {
      id: 'avenue',
      name: 'Avenue Securities',
      category: 'global',
      logoText: 'Avenue',
      badge: 'Mais Popular BR',
      rating: 4.8,
      description:
        'Criada sob medida para brasileiros investirem no exterior. Aplicativo totalmente em português, relatórios automáticos de Imposto de Renda (DARF/GCAP) e conta bancária internacional.',
      spreadCambio: '1,4% a 2,0% (dependendo do volume)',
      brokerageFee: 'Zero corretagem em planos selecionados',
      regulation: 'SEC, FINRA, SIPC',
      minDeposit: 'R$ 100 via PIX instantâneo',
      features: [
        'Câmbio via PIX com conversão imediata para USD',
        'Relatório de IR pronto para declaração anual',
        'Cartão de débito internacional físico e virtual',
      ],
      websiteUrl: 'https://avenue.us',
    },
    {
      id: 'nomad',
      name: 'Nomad Global',
      category: 'global',
      logoText: 'Nomad',
      badge: 'Conta Global',
      rating: 4.7,
      description:
        'Conta corrente em dólar sediada nos EUA e plataforma de investimentos em Wall Street. Excelente para compras internacionais, viagens à Europa e investimentos em ETFs globais.',
      spreadCambio: '1,0% a 2,0% com programa de fidelidade',
      brokerageFee: 'Zero corretagem para ações e ETFs',
      regulation: 'SIPC (seguro até $500k), FDIC ($250k)',
      minDeposit: 'R$ 100 via PIX',
      features: [
        'Cartão aceito em mais de 180 países',
        'IOF reduzido de 1,1% em remessas para conta corrente',
        'Salas VIP em aeroportos para clientes selecionados',
      ],
      websiteUrl: 'https://www.nomadglobal.com',
    },
    {
      id: 'xp',
      name: 'XP Investimentos',
      category: 'brasil',
      logoText: 'XP',
      badge: 'Maior do Brasil',
      rating: 4.8,
      description:
        'Maior ecossistema de investimentos do Brasil. Oferece ações B3, fundos imobiliários, renda fixa com títulos do Tesouro e CDBs, além de conta internacional integrada.',
      spreadCambio: '1,5% a 2,0%',
      brokerageFee: 'Zero para FIIs e Ações online',
      regulation: 'CVM, ANBIMA, Banco Central do Brasil',
      minDeposit: 'Sem mínimo',
      features: [
        'Acesso completo a todos os produtos da B3',
        'Assessoria especializada de investimentos',
        'Conta internacional integrada no mesmo app',
      ],
      websiteUrl: 'https://www.xpi.com.br',
    },
    {
      id: 'btg',
      name: 'BTG Pactual',
      category: 'brasil',
      logoText: 'BTG',
      badge: 'Banco Premium',
      rating: 4.9,
      description:
        'O maior banco de investimentos da América Latina. Plataforma sólida, ampla prateleira de renda fixa exclusiva, fundos de previdência e conta banking premium.',
      spreadCambio: '1,2% a 1,8%',
      brokerageFee: 'Zero em planos digitais',
      regulation: 'CVM, Banco Central do Brasil, ANBIMA',
      minDeposit: 'Sem mínimo',
      features: [
        'Solidez e governança de banco de primeira linha',
        'Renda fixa com emissões diretas e taxas atrativas',
        'Cartão Black modular com cashback ou milhas',
      ],
      websiteUrl: 'https://www.btgpactual.com',
    },
    {
      id: 'binance',
      name: 'Binance',
      category: 'crypto',
      logoText: 'Binance',
      badge: 'Líder Cripto',
      rating: 4.8,
      description:
        'A maior corretora de ativos digitais do planeta por volume. Negociação de Bitcoin, Ethereum, stablecoins em Dólar e Euro, staking com rendimento passivo e saques rápidos em PIX.',
      spreadCambio: 'Paridade direta em livros de ofertas',
      brokerageFee: 'A partir de 0,075% por transação',
      regulation: 'Conformidade global e autorizações locais',
      minDeposit: 'R$ 10 via PIX',
      features: [
        'Depósitos e saques instantâneos em Reais (BRL) e Euros (EUR)',
        'Mais de 350 pares de criptomoedas com alta liquidez',
        'Segurança avançada com fundo SAFU garantido',
      ],
      websiteUrl: 'https://www.binance.com',
    },
  ];

  const filteredBrokers = filter === 'all' ? brokers : brokers.filter((b) => b.category === filter);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Guia & Comparador de Corretoras</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Análise detalhada de instituições reguladas para investir no Brasil, Estados Unidos e Europa com segurança.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'Todas as Corretoras' },
              { id: 'global', label: 'Internacionais (EUA & Europa)' },
              { id: 'brasil', label: 'Brasil (B3)' },
              { id: 'crypto', label: 'Criptomoedas' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
                filter === item.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Segurança e Regulação Oficial:</strong> O DinhEuro recomenda apenas corretoras autorizadas por órgãos supervisores como CVM e Banco Central no Brasil, SEC e FINRA nos Estados Unidos, e BaFin/FCA na Europa. Suas contas internacionais contam com proteção do SIPC (até $500.000 em valores mobiliários).
        </div>
      </div>

      {/* Brokers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrokers.map((broker) => (
          <div
            key={broker.id}
            className="rounded-2xl bg-[#0d1627] border border-slate-800 hover:border-slate-700 p-5 shadow-xl transition flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {broker.name}
                    </h2>
                    {broker.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {broker.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-semibold">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-300">({broker.rating})</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 flex-shrink-0 shadow-inner">
                  {broker.logoText.slice(0, 3)}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                {broker.description}
              </p>

              {/* Specs Grid */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Spread em Câmbio:</span>
                  <span className="font-semibold text-slate-200">{broker.spreadCambio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Corretagem:</span>
                  <span className="font-semibold text-slate-200">{broker.brokerageFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Depósito Mínimo:</span>
                  <span className="font-semibold text-emerald-400 font-mono-numbers">{broker.minDeposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reguladores:</span>
                  <span className="font-semibold text-slate-300">{broker.regulation}</span>
                </div>
              </div>

              {/* Key Features Bullet points */}
              <div className="mt-4 space-y-1.5">
                {broker.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Link Button */}
            <div className="pt-3 border-t border-slate-800/80">
              <a
                href={broker.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 text-xs font-bold text-slate-200 hover:text-white transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Acessar Portal Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
