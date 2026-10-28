import React, { useState } from 'react';
import { ExternalLink, Search, Newspaper, Filter, Clock, TrendingUp } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { INITIAL_NEWS, NewsItem } from '../services/marketData';

export const NewsView: React.FC = () => {
  const { news } = useMarket();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newsSearch, setNewsSearch] = useState<string>('');

  // Extended list of authoritative news items
  const allNews: NewsItem[] = [
    ...news,
    {
      id: 'news_extra_1',
      title: 'Banco Central do Brasil sinaliza postura rígida e monitora expectativas de inflação de longo prazo',
      summary: 'A ata do Copom destacou que a assimetria de riscos fiscais e a desvalorização cambial exigem cautela reforçada na condução da política monetária.',
      source: 'Valor Econômico',
      url: 'https://valor.globo.com/brasil/',
      category: 'Macro',
      datetime: 'Há 3 horas',
      imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'news_extra_2',
      title: 'Ações europeias fecham em alta com balanços corporativos de bancos e montadoras na Alemanha',
      summary: 'O índice DAX de Frankfurt e o CAC de Paris avançaram após resultados trimestrais acima do consenso de analistas no setor industrial.',
      source: 'Reuters',
      url: 'https://www.reuters.com/markets/europe/',
      category: 'Ações',
      datetime: 'Há 4 horas',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'news_extra_3',
      title: 'Mercado de Câmbio: O impacto do diferencial de juros Selic vs Fed Funds na trajetória do Real',
      summary: 'Especialistas analisam os fluxos de carry trade e como as eleições nos Estados Unidos podem alterar as reservas globais e moedas emergentes.',
      source: 'InfoMoney',
      url: 'https://www.infomoney.com.br/mercados/cambio/',
      category: 'Câmbio',
      datetime: 'Há 5 horas',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const categories = [
    { id: 'all', label: 'Todas as Notícias' },
    { id: 'Macro', label: 'Macroeconomia' },
    { id: 'Câmbio', label: 'Câmbio & Euro' },
    { id: 'Ações', label: 'Ações & B3' },
    { id: 'Cripto', label: 'Criptoativos' },
  ];

  const filteredNews = allNews.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.source.toLowerCase().includes(newsSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-emerald-400" />
            <span>Notícias & Análises em Tempo Real</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cobertura jornalística e relatórios de mercado com fontes externas verificadas (Bloomberg, Reuters, Valor Econômico, FT).
          </p>
        </div>

        {/* News Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por termo ou fonte..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills (responsive, no-wrap, touch-friendly) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              filterCategory === cat.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl bg-[#0d1627] border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg transition flex flex-col justify-between group"
          >
            {item.imageUrl && (
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {item.category}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {item.datetime}
                </span>
              </div>
            )}

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition leading-snug">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              {/* CRITICAL UX REQUIREMENT: External safe link with target="_blank" and rel="noopener noreferrer" */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <span>{item.source}</span>
                </div>

                <a
                  href={item.url.startsWith('http://') || item.url.startsWith('https://') ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-sm shadow-emerald-950 transition active:scale-95 cursor-pointer"
                  title={`Abrir reportagem original em ${item.source}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Ler matéria</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
