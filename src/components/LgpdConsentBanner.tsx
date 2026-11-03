import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, ArrowRight, X } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

const LGPD_STORAGE_KEY = 'dinheuro_lgpd_accepted';

export const LgpdConsentBanner: React.FC = () => {
  const { setActiveTab } = useMarket();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check initial acceptance
    const accepted = localStorage.getItem(LGPD_STORAGE_KEY);
    if (!accepted) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listener to re-open banner when user clicks "Redefinir Preferências de Cookies"
    const handleReopen = () => {
      setIsVisible(true);
    };

    window.addEventListener('dinheuro_reopen_cookie_banner', handleReopen);
    return () => {
      window.removeEventListener('dinheuro_reopen_cookie_banner', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(LGPD_STORAGE_KEY, JSON.stringify({
        accepted: true,
        date: new Date().toISOString(),
        version: '2026.1',
      }));
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleOpenPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('privacidade');
  };

  const handleOpenCookies = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('cookies');
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de Cookies e Privacidade LGPD"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      <div className="max-w-5xl mx-auto pointer-events-auto bg-[#0a1220]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Text & Icon */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Privacidade & Cookies no DinhEuro
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  LGPD & GDPR
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos cookies essenciais, armazenamento local (localStorage) e tecnologias de cache no PWA para memorizar suas carteiras, salvar preferências visuais e garantir a segurança das cotações em tempo real, em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                <button
                  type="button"
                  onClick={handleOpenPrivacy}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition cursor-pointer"
                >
                  Saber mais / Política de Privacidade
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleOpenCookies}
                  className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Política de Cookies
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Aceitar e Continuar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
