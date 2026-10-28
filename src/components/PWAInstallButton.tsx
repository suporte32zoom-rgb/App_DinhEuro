import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>App Instalado</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-900/40 transition active:scale-95 cursor-pointer flex-shrink-0"
        title="Instalar DinhEuro como aplicativo no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition flex-shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="DinhEuro Logo" className="w-8 h-8 rounded-full border border-amber-400/30" />
                  <h3 className="text-base font-bold text-white">Instalar DinhEuro</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                1. No Safari do seu iPhone ou iPad, toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta para cima).<br /><br />
                2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.<br /><br />
                3. Toque em <strong>"Adicionar"</strong> no canto superior direito para ter acesso instantâneo ao DinhEuro.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback direct install button for other platforms / browsers
  return (
    <button
      onClick={() => {
        alert('Para instalar o DinhEuro: acesse as opções do seu navegador (três pontinhos) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition flex-shrink-0 cursor-pointer"
      title="Instalar DinhEuro no seu computador ou celular"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Instalar App</span>
    </button>
  );
};
