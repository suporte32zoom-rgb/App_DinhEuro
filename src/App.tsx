/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { Footer } from './components/Footer';
import { AssetDetailModal } from './components/AssetDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

import { DashboardView } from './views/DashboardView';
import { MarketsView } from './views/MarketsView';
import { PortfolioView } from './views/PortfolioView';
import { DayTradeView } from './views/DayTradeView';
import { TapeReadingView } from './views/TapeReadingView';
import { FixedIncomeDerivativesView } from './views/FixedIncomeDerivativesView';
import { NewsView } from './views/NewsView';
import { BrokersView } from './views/BrokersView';
import { AdvancedChartsView } from './views/AdvancedChartsView';
import { ToolsView } from './views/ToolsView';
import { AcademyView } from './views/AcademyView';
import { AboutView } from './views/AboutView';
import { TermsOfUseView } from './views/TermsOfUseView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { CookiePolicyView } from './views/CookiePolicyView';
import { DisclaimerView } from './views/DisclaimerView';
import { LgpdConsentBanner } from './components/LgpdConsentBanner';

const MainContent: React.FC = () => {
  const { activeTab } = useMarket();
  const isTerminalMode = activeTab === 'daytrade' || activeTab === 'tape_reading';

  return (
    <main
      className={`${
        activeTab === 'daytrade'
          ? 'w-full h-screen p-0 m-0 overflow-hidden flex flex-col max-w-none'
          : isTerminalMode
          ? 'w-full max-w-[1920px] mx-auto px-0 sm:px-1 pt-0 pb-0 flex-1 flex flex-col min-h-0 h-[calc(100vh-66px)] overflow-hidden'
          : 'max-w-7xl mx-auto px-3 sm:px-6 pt-5 sm:pt-6 flex-1 w-full'
      }`}
    >
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'mercados' && <MarketsView />}
      {activeTab === 'carteiras' && <PortfolioView />}
      {activeTab === 'daytrade' && <DayTradeView />}
      {activeTab === 'tape_reading' && <TapeReadingView />}
      {activeTab === 'renda_fixa' && <FixedIncomeDerivativesView />}
      {activeTab === 'noticias' && <NewsView />}
      {activeTab === 'corretoras' && <BrokersView />}
      {activeTab === 'graficos' && <AdvancedChartsView />}
      {activeTab === 'ferramentas' && <ToolsView />}
      {activeTab === 'academy' && <AcademyView />}
      {activeTab === 'sobre' && <AboutView />}
      {activeTab === 'termos' && <TermsOfUseView />}
      {activeTab === 'privacidade' && <PrivacyPolicyView />}
      {activeTab === 'cookies' && <CookiePolicyView />}
      {activeTab === 'disclaimer' && <DisclaimerView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { theme, activeTab } = useMarket();
  const isTerminalMode = activeTab === 'daytrade' || activeTab === 'tape_reading';

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0B1320] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      } flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-150 ${
        isTerminalMode ? 'h-screen overflow-hidden' : ''
      }`}
    >
      {/* Real-time Top Marquee Ribbon (Hidden in Day Trade Pro to use its integrated continuous ticker bar) */}
      {activeTab !== 'daytrade' && <TickerTape />}

      {/* Global Responsive Navigation Header (Hidden in Day Trade Pro to faithfully replicate the full-screen terminal header) */}
      {activeTab !== 'daytrade' && <Header />}

      {/* Dynamic Route View */}
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>

      {/* Interactive Asset Detail & Candlestick Modal */}
      <AssetDetailModal />

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Institutional Footer (Hidden in Terminal Pro mode to eliminate vertical scroll) */}
      {!isTerminalMode && <Footer />}

      {/* LGPD & Cookie Consent Persistent Banner */}
      <LgpdConsentBanner />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <MarketProvider>
        <AppShell />
      </MarketProvider>
    </ErrorBoundary>
  );
}
