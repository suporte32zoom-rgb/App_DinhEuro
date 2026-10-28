import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  category: 'Câmbio' | 'Ações' | 'Macro' | 'Cripto';
  definition: string;
}

export const AcademyView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const modules = [
    {
      id: 'm1',
      title: 'Do Real ao Euro: Blindagem Patrimonial em Moeda Forte',
      level: 'Iniciante ao Avançado',
      duration: '45 min',
      description:
        'Aprenda como estruturar uma reserva financeira internacional, entender a paridade EUR/BRL, spreads cambiais e como mitigar o risco Brasil.',
      lessons: [
        'Por que ter patrimônio em Euro e Dólar?',
        'Diferença entre Câmbio Comercial e Turismo',
        'Contas globais vs corretoras internacionais',
      ],
    },
    {
      id: 'm2',
      title: 'Como Investir em Ações Globais e ETFs',
      level: 'Intermediário',
      duration: '60 min',
      description:
        'Passo a passo para comprar ações das maiores empresas do mundo (Apple, Nvidia, Microsoft, ASML) e fundos de índice (S&P 500, MSCI World).',
      lessons: [
        'Análise de ETFs acumuladores e distributivos',
        'Dividendos no exterior e retenção de impostos',
        'Rebalanceamento de portfólio global',
      ],
    },
    {
      id: 'm3',
      title: 'Decodificando os Mercados: Análise Técnica e Fundamentalista',
      level: 'Avançado',
      duration: '50 min',
      description:
        'Domine os múltiplos financeiros essenciais (P/L, EV/EBITDA, Dividend Yield) e leitura de gráficos de velas e médias móveis.',
      lessons: [
        'Como interpretar velas japonesas e suporte/resistência',
        'Médias móveis de 20, 50 e 200 períodos',
        'O que é o RSI e como detectar sobrecompra',
      ],
    },
  ];

  const glossary: GlossaryTerm[] = [
    {
      term: 'Spread Cambial',
      category: 'Câmbio',
      definition:
        'A diferença entre a cotação interbancária de mercado (preço de custo da moeda) e a taxa cobrada pelo banco ou corretora na conversão.',
    },
    {
      term: 'SIPC (Securities Investor Protection Corporation)',
      category: 'Ações',
      definition:
        'Entidade dos Estados Unidos que protege contas de clientes em corretoras reguladas até o limite de US$ 500.000 em valores mobiliários em caso de falência.',
    },
    {
      term: 'Carry Trade',
      category: 'Câmbio',
      definition:
        'Operação financeira em que um investidor toma dinheiro emprestado em um país com taxa de juros baixa (ex: Japão ou Europa) para aplicar em outro com juros altos (ex: Brasil).',
    },
    {
      term: 'P/L (Preço sobre Lucro / P/E Ratio)',
      category: 'Ações',
      definition:
        'Múltiplo de avaliação que indica quantos anos o investidor levaria para reaver o capital investido considerando o lucro atual da empresa.',
    },
    {
      term: 'Dividend Yield (DY)',
      category: 'Ações',
      definition:
        'Relação percentual entre os proventos pagos por uma ação nos últimos 12 meses e o preço de mercado atual de sua cotação.',
    },
    {
      term: 'Selic e CDI',
      category: 'Macro',
      definition:
        'A taxa Selic é a taxa básica de juros da economia brasileira definida pelo Copom. O CDI (Certificado de Depósito Interbancário) é a taxa que bancos cobram entre si e costuma andar 0,10% abaixo da Selic.',
    },
    {
      term: 'Halving do Bitcoin',
      category: 'Cripto',
      definition:
        'Evento programado no protocolo do Bitcoin a cada 210.000 blocos (aprox. 4 anos) que corta pela metade a emissão de novas moedas geradas por bloco minerado.',
    },
    {
      term: 'Hedge Cambial',
      category: 'Câmbio',
      definition:
        'Estratégia de proteção patrimonial utilizada para neutralizar o risco de variação abrupta de moedas estrangeiras sobre ativos ou passivos.',
    },
  ];

  const filteredGlossary = glossary.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-400" />
          <span>DinhEuro Academy & Centro de Conhecimento</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Educação financeira independente para formação de patrimônio em moedas fortes e mercados globais.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Trilhas de Aprendizado em Destaque</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modules.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {m.level}
                  </span>
                  <span className="text-slate-400">{m.duration}</span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Tópicos do Módulo:
                  </span>
                  {m.lessons.map((lesson, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => alert(`Você iniciou a trilha: "${m.title}". Conteúdo liberado gratuitamente no DinhEuro!`)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Acessar Módulo Grátis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dicionário Financeiro A-Z */}
      <div className="rounded-2xl bg-[#0d1627] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Glossário & Dicionário Financeiro A-Z</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Definições claras de termos técnicos do mercado financeiro brasileiro e global.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar termo no glossário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'Todos os Termos' },
              { id: 'Câmbio', label: 'Câmbio & Moedas' },
              { id: 'Ações', label: 'Ações & Bolsa' },
              { id: 'Macro', label: 'Macroeconomia' },
              { id: 'Cripto', label: 'Criptoativos' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
                activeCategory === c.id
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Glossary Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGlossary.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#070e1b] rounded-xl p-4 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white">{item.term}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
