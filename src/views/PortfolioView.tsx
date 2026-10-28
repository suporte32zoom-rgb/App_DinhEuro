import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  PieChart,
  DollarSign,
  Briefcase,
  X,
  Check,
} from 'lucide-react';
import { useMarket, PortfolioPosition } from '../context/MarketContext';
import { formatCurrencyValue } from '../utils/finance';

export const PortfolioView: React.FC = () => {
  const { portfolio, addPortfolioPosition, removePortfolioPosition, assets, universalRates } =
    useMarket();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('PETR4');
  const [newName, setNewName] = useState('Petrobras PN');
  const [newType, setNewType] = useState<'stock_br' | 'stock_us' | 'crypto' | 'forex'>('stock_br');
  const [newQuantity, setNewQuantity] = useState<number>(100);
  const [newBuyPrice, setNewBuyPrice] = useState<number>(35.0);
  const [newCurrency, setNewCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');

  // Compute live value for each portfolio position
  const positionsWithLiveMetrics = portfolio.map((pos) => {
    // Find matching asset
    const matching = assets.find(
      (a) => a.symbol.toLowerCase() === pos.symbol.toLowerCase() || a.id.toLowerCase() === pos.symbol.toLowerCase()
    );
    const currentPrice = matching ? matching.price : pos.averageBuyPrice;
    const totalCost = pos.quantity * pos.averageBuyPrice;
    const currentTotalValue = pos.quantity * currentPrice;
    const profitLoss = currentTotalValue - totalCost;
    const profitPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    // Convert to BRL for unified total
    let currentTotalBRL = currentTotalValue;
    if (pos.currency === 'USD') {
      currentTotalBRL = currentTotalValue * universalRates.BRL;
    } else if (pos.currency === 'EUR') {
      currentTotalBRL = currentTotalValue * (universalRates.BRL / (universalRates.EUR || 0.92));
    }

    return {
      ...pos,
      currentPrice,
      totalCost,
      currentTotalValue,
      currentTotalBRL,
      profitLoss,
      profitPercent,
    };
  });

  const totalPortfolioValueBRL = positionsWithLiveMetrics.reduce(
    (acc, p) => acc + p.currentTotalBRL,
    0
  );
  const totalCostBRL = positionsWithLiveMetrics.reduce((acc, p) => {
    let costInBRL = p.totalCost;
    if (p.currency === 'USD') costInBRL = p.totalCost * universalRates.BRL;
    else if (p.currency === 'EUR') costInBRL = p.totalCost * (universalRates.BRL / (universalRates.EUR || 0.92));
    return acc + costInBRL;
  }, 0);

  const totalPLBRL = totalPortfolioValueBRL - totalCostBRL;
  const totalPLPercent = totalCostBRL > 0 ? (totalPLBRL / totalCostBRL) * 100 : 0;
  const isOverallPositive = totalPLBRL >= 0;

  // Breakdown by asset type
  const typeTotals = positionsWithLiveMetrics.reduce(
    (acc, p) => {
      acc[p.assetType] = (acc[p.assetType] || 0) + p.currentTotalBRL;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || newQuantity <= 0 || newBuyPrice <= 0) return;

    addPortfolioPosition({
      symbol: newSymbol.toUpperCase(),
      name: newName || newSymbol.toUpperCase(),
      assetType: newType,
      quantity: Number(newQuantity),
      averageBuyPrice: Number(newBuyPrice),
      currency: newCurrency,
      purchaseDate: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Gerenciador de Carteiras Globais</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de patrimônio unificado em Real, Euro e Dólar com valorização automática em tempo real.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Posição</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-[#0d1627] rounded-2xl border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Patrimônio Total da Carteira
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white mt-1">
            {formatCurrencyValue(totalPortfolioValueBRL, 'BRL')}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
            <span>≈ € {(totalPortfolioValueBRL / (universalRates.BRL / (universalRates.EUR || 0.92))).toFixed(2)}</span>
            <span>•</span>
            <span>≈ $ {(totalPortfolioValueBRL / universalRates.BRL).toFixed(2)}</span>
          </div>
        </div>

        {/* Total Profit / Loss */}
        <div className="bg-[#0d1627] rounded-2xl border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Lucro / Prejuízo Total (P&L)
          </span>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono-numbers mt-1 flex items-baseline gap-1.5 ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{isOverallPositive ? '+' : ''}{formatCurrencyValue(totalPLBRL, 'BRL')}</span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-bold font-mono-numbers mt-2 ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isOverallPositive ? '+' : ''}{totalPLPercent.toFixed(2)}% de rentabilidade acumulada</span>
          </div>
        </div>

        {/* Positions Count & Diversification */}
        <div className="bg-[#0d1627] rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Diversificação da Carteira
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white mt-1">
              {portfolio.length} <span className="text-xs font-normal text-slate-400">ativos</span>
            </div>
          </div>

          {/* Allocation mini progress bars */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex mt-3">
            <div
              style={{ width: `${((typeTotals.stock_br || 0) / (totalPortfolioValueBRL || 1)) * 100}%` }}
              className="bg-emerald-500 h-full"
              title="Ações BR"
            />
            <div
              style={{ width: `${((typeTotals.stock_us || 0) / (totalPortfolioValueBRL || 1)) * 100}%` }}
              className="bg-blue-500 h-full"
              title="Ações US"
            />
            <div
              style={{ width: `${((typeTotals.crypto || 0) / (totalPortfolioValueBRL || 1)) * 100}%` }}
              className="bg-amber-500 h-full"
              title="Cripto"
            />
            <div
              style={{ width: `${((typeTotals.forex || 0) / (totalPortfolioValueBRL || 1)) * 100}%` }}
              className="bg-purple-500 h-full"
              title="Forex / Euro"
            />
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="rounded-2xl bg-[#0d1627] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-[#070e1b] flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Posições Abertas no Portfólio
          </h3>
          <span className="text-[11px] text-slate-400">
            Valores atualizados com a cotação do segundo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Ativo</th>
                <th className="py-3 px-4 text-right">Qtd</th>
                <th className="py-3 px-4 text-right">Preço Médio</th>
                <th className="py-3 px-4 text-right">Preço Atual</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-right">Retorno (P&L)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positionsWithLiveMetrics.map((pos) => {
                const isPos = pos.profitLoss >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-extrabold text-white text-xs">{pos.symbol}</div>
                        <div className="text-[11px] text-slate-400">{pos.name}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers font-semibold text-slate-200">
                      {pos.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers text-slate-300">
                      {formatCurrencyValue(pos.averageBuyPrice, pos.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white">
                      {formatCurrencyValue(pos.currentPrice, pos.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-white">
                      {formatCurrencyValue(pos.currentTotalValue, pos.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          isPos ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {formatCurrencyValue(pos.profitLoss, pos.currency)} ({isPos ? '+' : ''}
                        {pos.profitPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => removePortfolioPosition(pos.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remover posição da carteira"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Position */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>Adicionar Nova Posição</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ticker / Código</label>
                <input
                  type="text"
                  required
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="Ex: PETR4, AAPL, BTC/USD, EUR/BRL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Ativo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Petrobras PN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="stock_br">Ações Brasil (B3)</option>
                    <option value="stock_us">Ações EUA</option>
                    <option value="crypto">Criptomoeda</option>
                    <option value="forex">Câmbio / Moeda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Moeda</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dólar ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preço Médio de Compra</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newBuyPrice}
                    onChange={(e) => setNewBuyPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
                >
                  Adicionar à Carteira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
