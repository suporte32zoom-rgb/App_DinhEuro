import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { UnifiedAssetDetailView } from './UnifiedAssetDetailView';

export const AssetDetailModal: React.FC = () => {
  const { selectedAsset, setSelectedAsset } = useMarket();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAsset(null);
      }
    };
    if (selectedAsset) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAsset, setSelectedAsset]);

  if (!selectedAsset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => setSelectedAsset(null)}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes do ativo ${selectedAsset.symbol}`}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-[#070e1b] border border-slate-700/80 shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar with Close Action */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#091120]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedAsset.flag || '📊'}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Detalhes & Análise do Ativo • DinhEuro
            </span>
          </div>

          <button
            onClick={() => setSelectedAsset(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Fechar Detalhes (Esc)"
          >
            <span className="hidden sm:inline">Fechar</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 no-scrollbar">
          <UnifiedAssetDetailView
            asset={selectedAsset}
            onBack={() => setSelectedAsset(null)}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};
